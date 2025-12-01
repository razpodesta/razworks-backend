/**
 * @fileoverview Perfiles de Usuario (Schema v2 - Realms)
 * @module Infra/Database/Schema
 */
import { pgTable, uuid, text, timestamp, integer, pgEnum, index } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('user_role', ['CLIENT', 'FREELANCER', 'ADMIN']);

// CAMBIO CRÍTICO: Nuevo Enum de Postgres
export const realmEnum = pgEnum('razter_realm', [
  'THE_SCRIPT',
  'THE_COMPILER',
  'THE_KERNEL',
  'THE_NETWORK',
  'THE_SOURCE'
]);

export const profilesTable = pgTable('profiles', {
  id: uuid('id').primaryKey(),

  email: text('email').notNull(),
  fullName: text('full_name').notNull(),
  avatarUrl: text('avatar_url'),

  role: roleEnum('role').default('CLIENT').notNull(),

  // Columna actualizada: current_realm (antes current_tier)
  currentRealm: realmEnum('current_realm').default('THE_SCRIPT').notNull(),

  totalXp: integer('total_xp').default(0).notNull(),
  reputationScore: integer('reputation_score').default(100).notNull(),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    emailIdx: index('profile_email_idx').on(table.email),
    // Índice para buscar "Todos los miembros del Kernel"
    realmIdx: index('profile_realm_idx').on(table.currentRealm)
  };
});
