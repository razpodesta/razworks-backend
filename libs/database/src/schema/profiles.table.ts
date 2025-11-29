/**
 * @fileoverview Tabla de Perfiles Públicos
 * @module Infra/Database/Schema
 */
import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('user_role', ['CLIENT', 'FREELANCER', 'ADMIN']);

export const profilesTable = pgTable('profiles', {
  id: uuid('id').primaryKey().notNull(), // Se vincula con auth.users.id de Supabase
  email: text('email').notNull(),
  fullName: text('full_name').notNull(),
  avatarUrl: text('avatar_url'),
  role: roleEnum('role').default('CLIENT').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
