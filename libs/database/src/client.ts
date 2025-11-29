/**
 * @fileoverview Cliente Drizzle + Postgres
 * @module Infra/Database/Client
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/schema-index'; // Crearemos este índice abajo

// Validación Zod para variables de entorno críticas (Pilar X)
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
});

// Solo validamos si estamos en runtime, no en build time
const env = process.env.NODE_ENV !== 'test' ? envSchema.parse(process.env) : { DATABASE_URL: '' };

const client = postgres(env.DATABASE_URL, { prepare: false });
export const db = drizzle(client, { schema });
