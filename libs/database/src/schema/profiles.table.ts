/**
 * @fileoverview Perfiles de Usuario & Gamificación
 */
import { pgTable, uuid, text, timestamp, integer, pgEnum, index } from 'drizzle-orm/pg-core';

// Enum nativo de Postgres es eficiente (4 bytes en disco)
export const roleEnum = pgEnum('user_role', ['CLIENT', 'FREELANCER', 'ADMIN']);
export const tierEnum = pgEnum('razter_tier', ['PLANKTON', 'BARRACUDA', 'TIGER_SHARK', 'MEGALODON']);

export const profilesTable = pgTable('profiles', {
  id: uuid('id').primaryKey(), // Vinculado a auth.users

  // Datos Core
  email: text('email').notNull(),
  fullName: text('full_name').notNull(),
  avatarUrl: text('avatar_url'),

  // Clasificación
  role: roleEnum('role').default('CLIENT').notNull(),
  currentTier: tierEnum('current_tier').default('PLANKTON').notNull(),

  // Gamificación (Ledger simplificado en perfil para lectura rápida)
  totalXp: integer('total_xp').default(0).notNull(),
  reputationScore: integer('reputation_score').default(100).notNull(), // 0-1000

  // Auditoría
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    emailIdx: index('profile_email_idx').on(table.email),
    tierIdx: index('profile_tier_idx').on(table.currentTier) // Para buscar "Todos los Megalodones"
  };
});
