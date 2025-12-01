/**
 * @fileoverview Repositorio de Auditoría (Zero-Latency)
 * @module Infra/Database/Repositories
 *
 * @author Raz Podestá & LIA Legacy
 * @copyright 2025 MetaShark Tech.
 *
 * @description
 * Maneja la inserción masiva de logs. Utiliza el DictionaryManager para
 * resolver IDs en memoria, evitando querys SELECT adicionales en cada inserción.
 */

import { Injectable, Logger } from '@nestjs/common';
import { db } from '../client';
import { auditLogsTable } from '../schema/audit-logs.table';
import { DictionaryManagerService } from '../services/dictionary-manager.service';
import { Result } from '@razworks/shared/utils';

export interface AuditEntry {
  userId?: string;
  actionCode: string; // 'AUTH_LOGIN'
  entityId?: string;
  metadata?: Record<string, unknown>;
  durationMs?: number;
}

@Injectable()
export class DrizzleAuditRepository {
  private readonly logger = new Logger(DrizzleAuditRepository.name);

  constructor(private readonly dictionary: DictionaryManagerService) {}

  /**
   * Registra un evento de auditoría de manera eficiente.
   */
  async log(entry: AuditEntry): Promise<Result<void, Error>> {
    try {
      // 1. Resolución de ID en Memoria (0ms DB Latency)
      const actionId = this.dictionary.getActionId(entry.actionCode);

      // 2. Inserción directa (Single Roundtrip)
      await db.insert(auditLogsTable).values({
        userId: entry.userId || null,
        actionId: actionId,
        entityId: entry.entityId,
        metadata: entry.metadata,
        durationMs: entry.durationMs || 0,
      });

      return Result.ok(undefined);

    } catch (error) {
      // Los logs nunca deben romper la aplicación, pero debemos reportar el fallo.
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to write audit log [${entry.actionCode}]: ${err.message}`);
      return Result.fail(err);
    }
  }
}
