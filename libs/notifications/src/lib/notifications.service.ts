/**
 * @fileoverview Servicio Maestro de Notificaciones (Hermes Core v2 - RAM Boosted)
 * @module Notifications/Core
 *
 * @author Raz Podestá & LIA Legacy
 * @copyright 2025 MetaShark Tech.
 *
 * @description
 * Coordina la verdad tripartita (SQL, Redis, PubSub).
 * OPTIMIZACIÓN: Usa DictionaryManagerService para resolución de IDs en O(1) (Memoria),
 * eliminando el roundtrip a la base de datos durante la ingesta.
 */

import { Inject, Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { Redis } from '@upstash/redis';
import { eq, and, desc, inArray } from 'drizzle-orm';

// Capa de Datos & Diccionarios
import { db, notificationsTable, DictionaryManagerService, actionCodesTable } from '@razworks/database';

// Infraestructura
import { PUB_SUB } from './infra/pubsub/redis-pubsub.provider';

// Modelos
import { NotificationFeed, NotificationItem, NotificationStatus } from './api/graphql/notification.model';

export interface CreateNotificationParams {
  userId: string;
  actionCode: string; // ej: 'PROJ_CREATED'
  metadata: Record<string, unknown>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly redisKV: Redis;

  constructor(
    @Inject(PUB_SUB) private readonly pubSub: RedisPubSub,
    private readonly dictionary: DictionaryManagerService // ✅ Inyección de Memoria
  ) {
    this.redisKV = Redis.fromEnv();
  }

  /**
   * DISPATCHER ATÓMICO (Ingesta de Alta Velocidad)
   */
  async dispatch(params: CreateNotificationParams): Promise<void> {
    const { userId, actionCode, metadata } = params;

    try {
      // 1. Resolución en Memoria (Zero-Latency Check)
      // Si el código no existe, el DictionaryManager lanzará un error controlado,
      // protegiendo la integridad de la base de datos sin hacer una consulta.
      const actionId = this.dictionary.getActionId(actionCode);

      // 2. Persistencia Transaccional (Cold Storage)
      const [insertedRecord] = await db.insert(notificationsTable).values({
        userId,
        actionId, // Insertamos el ID numérico directo
        metadata,
        status: 'UNREAD',
      }).returning({
        id: notificationsTable.id,
        createdAt: notificationsTable.createdAt
      });

      if (!insertedRecord) throw new Error('Fallo en persistencia SQL.');

      // 3. Actualización de Estado Caliente (Hot Storage - Redis)
      const redisKey = `user:${userId}:unread_count`;
      await this.redisKV.incr(redisKey);

      // 4. Difusión en Tiempo Real (The Push - WebSocket)
      const payload: NotificationItem & { userId: string } = {
        id: insertedRecord.id,
        action: actionCode,
        status: NotificationStatus.UNREAD,
        metadata: JSON.stringify(metadata),
        createdAt: insertedRecord.createdAt,
        userId // Para filtrado de seguridad
      };

      await this.pubSub.publish('notificationAdded', {
        notificationAdded: payload
      });

      this.logger.debug(`🔔 Dispatched: [${actionCode}] -> User ${userId}`);

    } catch (error) {
      // Fail-Safe: El sistema de notificaciones nunca debe tumbar el proceso principal
      const errMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Dispatch Error [${actionCode}]: ${errMessage}`);
    }
  }

  /**
   * RECUPERACIÓN OPTIMIZADA (Feed)
   */
  async getUserFeed(userId: string, limit: number, offset: number): Promise<NotificationFeed> {
    try {
      // JOIN necesario para recuperar el código de texto legible para el frontend
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

      const redisKey = `user:${userId}:unread_count`;
      const cachedCount = await this.redisKV.get<number>(redisKey);

      // Auto-Healing: Si Redis está vacío o desincronizado
      let unreadCount = Number(cachedCount) || 0;
      if (unreadCount === 0 && itemsRaw.some(i => i.status === 'UNREAD')) {
        unreadCount = await this.recalculateUnreadCount(userId);
      }

      const items: NotificationItem[] = itemsRaw.map(i => ({
        id: i.id,
        action: i.action,
        status: i.status as NotificationStatus,
        metadata: JSON.stringify(i.metadata),
        createdAt: i.createdAt,
      }));

      return { unreadCount, items };

    } catch (error) {
      this.logger.error(`Error en getUserFeed: ${error}`);
      throw new InternalServerErrorException('Error recuperando notificaciones.');
    }
  }

  /**
   * MARCAR COMO LEÍDO
   */
  async markAsRead(userId: string, notificationIds: string[]): Promise<void> {
    if (!notificationIds.length) return;

    try {
      await db
        .update(notificationsTable)
        .set({ status: 'READ', readAt: new Date() })
        .where(
          and(
            eq(notificationsTable.userId, userId),
            inArray(notificationsTable.id, notificationIds),
            eq(notificationsTable.status, 'UNREAD')
          )
        );

      await this.recalculateUnreadCount(userId);
    } catch (error) {
      this.logger.error(`Error en markAsRead: ${error}`);
      throw new InternalServerErrorException('Error actualizando estado.');
    }
  }

  private async recalculateUnreadCount(userId: string): Promise<number> {
    const dbCount = await db.$count(
      notificationsTable,
      and(eq(notificationsTable.userId, userId), eq(notificationsTable.status, 'UNREAD'))
    );
    await this.redisKV.set(`user:${userId}:unread_count`, dbCount);
    return dbCount;
  }
}
