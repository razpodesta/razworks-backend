/**
 * @fileoverview Logs de Auditoría "Zero-Fat"
 * @description Usa referencias numéricas para minimizar el peso en disco.
 */
import { pgTable, uuid, timestamp, integer, jsonb, smallint, index } from 'drizzle-orm/pg-core';
import { actionCodesTable } from './dictionaries.table';

export const auditLogsTable = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),

  // Referencia al usuario (puede ser null para acciones del sistema)
  userId: uuid('user_id'),

  // OPTIMIZACIÓN: En lugar de guardar el string de la acción, guardamos el ID (2 bytes)
  actionId: smallint('action_id').references(() => actionCodesTable.id).notNull(),

  // ID de la entidad afectada (Proyecto, Propuesta, etc.)
  entityId: uuid('entity_id'),

  // Metadata variable (Solo lo estrictamente necesario que no quepa en el diccionario)
  // Recomendación: Usar claves cortas ej: { "ip": "...", "ua": "..." }
  metadata: jsonb('metadata'),

  // Métricas de performance
  durationMs: integer('duration_ms'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    // Índices estratégicos para búsquedas rápidas sin full-scan
    userIdx: index('audit_user_idx').on(table.userId),
    actionIdx: index('audit_action_idx').on(table.actionId),
    createdIdx: index('audit_created_idx').on(table.createdAt), // Vital para rangos de fecha
  };
});
