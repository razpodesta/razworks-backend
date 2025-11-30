/**
 * @fileoverview Tablas de Diccionario (Lookups)
 * @description Optimizan el almacenamiento reemplazando strings repetitivos por IDs numéricos.
 */
import { pgTable, smallserial, text, boolean } from 'drizzle-orm/pg-core';

// Catálogo de Acciones del Sistema
export const actionCodesTable = pgTable('dic_action_codes', {
  id: smallserial('id').primaryKey(),
  code: text('code').notNull().unique(),
  description: text('description'),
  isCritical: boolean('is_critical').default(false),
});

// Catálogo de Niveles de Gamificación (Razters)
export const tiersTable = pgTable('dic_tiers', {
  id: smallserial('id').primaryKey(),
  slug: text('slug').notNull().unique(), // 'PLANKTON', 'BARRACUDA'
  minXp: text('min_xp').notNull(),
  // ✅ FIX: Agregamos la columna descripción que faltaba
  description: text('description'),
});
