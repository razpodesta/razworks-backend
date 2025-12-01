/**
 * @fileoverview Servicio Maestro de Notificaciones (Refactorizado v2)
 * @module Notifications/Core
 * @description
 * Orquestador de alta integridad que sincroniza tres capas de realidad:
 * 1. Persistencia Fría (Postgres/Drizzle) - La verdad histórica.
 * 2. Estado Caliente (Redis KV) - Contadores de alto rendimiento.
 * 3. Tiempo Real (Redis PubSub) - Señalización instantánea.
 *
 * @author LIA Legacy & Raz Podestá
 */

import { Inject, Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { Redis } from '@upstash/redis';
import { eq, and, desc, inArray } from 'drizzle-orm';

// Infraestructura Interna
import { db, notificationsTable, actionCodesTable } from '@razworks/database';
import { PUB_SUB } from './infra/pubsub/redis-pubsub.provider';

// Tipos del Dominio
import { NotificationFeed, NotificationItem, NotificationStatus } from './api/graphql/notification.model';

export interface CreateNotificationParams {
  userId: string;
  actionCode: string;
  metadata: Record<string, unknown>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly redisKV: Redis; // Cliente HTTP para operaciones KV (Upstash)

  constructor(
    @Inject(PUB_SUB) private readonly pubSub: RedisPubSub, // Cliente TCP para PubSub
  ) {
    // Inicializamos el cliente KV (Stateless)
    this.redisKV = Redis.fromEnv();
  }

  /**
   * INGESTA DE EVENTOS (Pipeline de 3 Pasos)
   * Diseñado para ser invocado por Workers o Controladores.
   * Estrategia: Fail-Safe (No lanzamos error al caller si falla la notificación, solo logueamos).
   */
  async dispatch(params: CreateNotificationParams): Promise<void> {
    const { userId, actionCode, metadata } = params;

    try {
      // PASO 1: Validación y Resolución de Referencias (DB)
      const actionRef = await db
        .select({ id: actionCodesTable.id })
        .from(actionCodesTable)
        .where(eq(actionCodesTable.code, actionCode))
        .limit(1);

      if (!actionRef.length) {
        this.logger.warn(`⚠️ Dispatch Omitido: Action Code '${actionCode}' no existe en el diccionario.`);
        return;
      }

      const actionId = actionRef[0].id;

      // PASO 2: Persistencia Transaccional (DB)
      // Usamos 'returning' para obtener el ID y fecha generados por Postgres
      const [insertedRecord] = await db.insert(notificationsTable).values({
        userId,
        actionId,
        metadata,
        status: 'UNREAD',
      }).returning({
        id: notificationsTable.id,
        createdAt: notificationsTable.createdAt,
        status: notificationsTable.status
      });

      if (!insertedRecord) {
        throw new Error('Fallo crítico en inserción de base de datos.');
      }

      // PASO 3: Señalización de Estado Caliente (Redis KV)
      const redisKey = `user:${userId}:unread_count`;
      await this.redisKV.incr(redisKey);

      // PASO 4: Difusión en Tiempo Real (Redis PubSub -> GraphQL)
      // Construimos el payload exacto que espera el Resolver
      const notificationPayload: NotificationItem & { userId: string } = {
        id: insertedRecord.id,
        action: actionCode, // Enviamos el string legible, no el ID interno
        status: NotificationStatus.UNREAD,
        metadata: JSON.stringify(metadata),
        createdAt: insertedRecord.createdAt,
        userId: userId // Vital para el filtro de seguridad de la suscripción
      };

      await this.pubSub.publish('notificationAdded', {
        notificationAdded: notificationPayload
      });

      this.logger.log(`🔔 Hermes Dispatch: [${actionCode}] -> User ${userId}`);

    } catch (error) {
      // Manejo de errores encapsulado para no romper el flujo de negocio del llamante
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Error en Pipeline de Notificaciones: ${errorMessage}`, error instanceof Error ? error.stack : '');
    }
  }

  /**
   * RECUPERACIÓN DE FEED (Read Model)
   * Estrategia "Cache-Aside" con auto-corrección.
   */
  async getUserFeed(userId: string, limit: number, offset: number): Promise<NotificationFeed> {
    try {
      // A. Consulta Relacional Optimizada
      const itemsRaw = await db
        .select({
          id: notificationsTable.id,
          action: actionCodesTable.code,
          metadata: notificationsTable.metadata,
          status: notificationsTable.status,
          createdAt: notificationsTable.createdAt,
        })
        .from(notificationsTable)
        .innerJoin(actionCodesTable, eq(notificationsTable.actionId, actionCodesTable.id))
        .where(
          and(
            eq(notificationsTable.userId, userId),
            eq(notificationsTable.isDeleted, false)
          )
        )
        .orderBy(desc(notificationsTable.createdAt))
        .limit(limit)
        .offset(offset);

      // B. Consulta de Contador Caliente
      const redisKey = `user:${userId}:unread_count`;
      const cachedCount = await this.redisKV.get<number>(redisKey);
      let unreadCount = Number(cachedCount) || 0;

      // C. Lógica de Auto-Corrección (Self-Healing)
      // Si Redis dice 0 pero acabamos de traer items UNREAD, la caché está sucia.
      const hasUnreadInFeed = itemsRaw.some(i => i.status === 'UNREAD');

      if (unreadCount === 0 && hasUnreadInFeed) {
        this.logger.debug(`🔄 Redis Count Mismatch detected for ${userId}. Recalculating...`);

        // Recálculo costoso (DB Count) solo cuando es necesario
        const dbCount = await db.$count(
          notificationsTable,
          and(eq(notificationsTable.userId, userId), eq(notificationsTable.status, 'UNREAD'))
        );

        if (dbCount > 0) {
          await this.redisKV.set(redisKey, dbCount);
          unreadCount = dbCount;
        }
      }

      // D. Mapeo a Modelo GraphQL
      const items: NotificationItem[] = itemsRaw.map(i => ({
        id: i.id,
        action: i.action,
        status: i.status as NotificationStatus,
        metadata: JSON.stringify(i.metadata), // Serialización segura para GQL
        createdAt: i.createdAt,
      }));

      return { unreadCount, items };

    } catch (error) {
      this.logger.error(`Error recuperando feed: ${error}`);
      throw new InternalServerErrorException('No se pudo cargar el centro de notificaciones.');
    }
  }

  /**
   * ACCIÓN DE LECTURA (Command Model)
   * Actualización atómica y resincronización.
   */
  async markAsRead(userId: string, notificationIds: string[]): Promise<void> {
    if (!notificationIds.length) return;

    try {
      // 1. Actualización Masiva en DB
      await db
        .update(notificationsTable)
        .set({
          status: 'READ',
          readAt: new Date()
        })
        .where(
          and(
            eq(notificationsTable.userId, userId),
            inArray(notificationsTable.id, notificationIds),
            eq(notificationsTable.status, 'UNREAD') // Optimización: Solo tocar las que no estaban leídas
          )
        );

      // 2. Recálculo Absoluto del Contador
      // Es más seguro recalcular que decrementar para evitar condiciones de carrera negativas
      const realUnreadCount = await db.$count(
        notificationsTable,
        and(eq(notificationsTable.userId, userId), eq(notificationsTable.status, 'UNREAD'))
      );

      // 3. Actualización de Redis
      const redisKey = `user:${userId}:unread_count`;
      await this.redisKV.set(redisKey, realUnreadCount);

    } catch (error) {
      this.logger.error(`Error marcando como leídas: ${error}`);
      throw new InternalServerErrorException('Fallo al actualizar el estado de lectura.');
    }
  }
}
