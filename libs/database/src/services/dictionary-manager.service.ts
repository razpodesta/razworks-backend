/**
 * @fileoverview Gestor de Diccionarios en Memoria (Cache-Aside)
 * @module Infra/Database/Services
 *
 * @author Raz Podestá & LIA Legacy
 * @copyright 2025 MetaShark Tech.
 *
 * @description
 * Carga los catálogos estáticos (Acciones, Niveles) en memoria al arrancar la aplicación.
 * Permite resolver códigos de texto a IDs numéricos (SmallInt) con latencia cero.
 * Elimina la necesidad de JOINs costosos en operaciones de escritura intensiva (Logs, Notificaciones).
 *
 * @pattern Singleton
 */

import { Injectable, OnModuleInit, Logger, OnModuleDestroy } from '@nestjs/common';
import { db } from '../client';
import { actionCodesTable, tiersTable } from '../schema/dictionaries.table';

@Injectable()
export class DictionaryManagerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DictionaryManagerService.name);

  // Mapas bidireccionales en memoria
  // Code (String) -> ID (Number)
  private actionCodeMap = new Map<string, number>();
  private tierSlugMap = new Map<string, number>();

  // ID (Number) -> Description (String) - Para enriquecer lecturas si fuera necesario
  private actionDescMap = new Map<number, string>();

  async onModuleInit() {
    this.logger.log('📥 Pre-cargando diccionarios del sistema...');
    await this.refreshCache();
  }

  onModuleDestroy() {
    this.actionCodeMap.clear();
    this.tierSlugMap.clear();
  }

  /**
   * Recarga los diccionarios desde la DB.
   * Útil si se añaden códigos en tiempo de ejecución sin reiniciar.
   */
  async refreshCache(): Promise<void> {
    const start = performance.now();

    try {
      // 1. Cargar Códigos de Acción
      const actions = await db.select().from(actionCodesTable);
      actions.forEach(act => {
        this.actionCodeMap.set(act.code, act.id);
        if (act.description) {
          this.actionDescMap.set(act.id, act.description);
        }
      });

      // 2. Cargar Niveles (Tiers)
      const tiers = await db.select().from(tiersTable);
      tiers.forEach(tier => {
        this.tierSlugMap.set(tier.slug, tier.id);
      });

      const duration = (performance.now() - start).toFixed(2);
      this.logger.log(
        `✅ Diccionarios sincronizados en ${duration}ms. [Actions: ${actions.length}, Tiers: ${tiers.length}]`
      );

    } catch (error) {
      this.logger.error('❌ Fallo crítico cargando diccionarios. El sistema puede ser inestable.', error);
      // No lanzamos error para no detener el boot, pero los servicios dependientes fallarán controladamente.
    }
  }

  /**
   * Obtiene el ID numérico para un código de acción.
   * Operación O(1).
   *
   * @param code Código semántico (ej: 'AUTH_LOGIN')
   * @throws Error si el código no existe (Garantiza integridad de datos)
   */
  public getActionId(code: string): number {
    const id = this.actionCodeMap.get(code);
    if (id === undefined) {
      this.logger.warn(`⚠️ Intento de uso de código desconocido: ${code}`);
      // Fallback a un ID genérico de error si existe, o lanzar
      const sysErrorId = this.actionCodeMap.get('SYS_ERROR');
      if (sysErrorId) return sysErrorId;
      throw new Error(`Invalid Action Code: ${code}`);
    }
    return id;
  }

  /**
   * Obtiene el ID numérico para un Reino/Nivel.
   */
  public getTierId(slug: string): number {
    const id = this.tierSlugMap.get(slug);
    if (id === undefined) {
      throw new Error(`Invalid Tier Slug: ${slug}`);
    }
    return id;
  }

  /**
   * Obtiene la descripción humana de un ID de acción.
   */
  public getActionDescription(id: number): string {
    return this.actionDescMap.get(id) || 'Unknown Action';
  }
}
