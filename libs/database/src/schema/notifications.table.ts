/**
 * @fileoverview Tabla de Notificaciones Eficiente (Skeleton Pattern)
 * @module Infra/Database/Schema
 */
import { pgTable, uuid, timestamp, jsonb, smallint, boolean, index, pgEnum } from 'drizzle-orm/pg-core';
import { profilesTable } from './profiles.table';
import { actionCodesTable } from './dictionaries.table';

// Enum de estado para ciclo de vida rápido
export const notificationStatusEnum = pgEnum('notification_status', ['UNREAD', 'READ', 'ARCHIVED']);

export const notificationsTable = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),

  // Usuario Destino
  userId: uuid('user_id').references(() => profilesTable.id).notNull(),

  // Acción (Referencia optimizada a smallint)
  actionId: smallint('action_id').references(() => actionCodesTable.id).notNull(),

  // Datos variables para hidratar el texto en el frontend
  metadata: jsonb('metadata').default({}).notNull(),

  // Estado del semáforo
  status: notificationStatusEnum('status').default('UNREAD').notNull(),

  // Auditoría y Limpieza
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  readAt: timestamp('read_at'),
}, (table) => {
  return {
    // Índice optimizado para el "Feed de Campanita"
    userIdx: index('idx_notifications_feed')
      .on(table.userId, table.status, table.createdAt),
  };
});
