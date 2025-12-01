/**
 * @fileoverview Cliente de Base de Datos Soberano (Drizzle + Postgres)
 * @module Infra/Database/Client
 *
 * @author Raz Podestá & LIA Legacy
 * @copyright 2025 MetaShark Tech.
 *
 * @description
 * Factory de conexión inteligente. Detecta si estamos conectados a un Transaction Pooler (Supavisor)
 * o directamente a la base de datos, ajustando la configuración de `prepare` para evitar errores
 * en entornos Serverless.
 *
 * @requires process.env.DATABASE_URL
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/schema-index';
import { z } from 'zod';
import { Logger } from '@nestjs/common';

// Validación estricta de entorno al inicio (Fail Fast)
const envSchema = z.object({
  DATABASE_URL: z.string().url({ message: "DATABASE_URL debe ser una URL válida de PostgreSQL" }),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// En entornos de test, no validamos la URL real para permitir mocks,
// pero en ejecución normal es mandatorio.
const isTest = process.env['NODE_ENV'] === 'test';
const env = !isTest ? envSchema.parse(process.env) : { DATABASE_URL: '', NODE_ENV: 'test' };

/**
 * Detecta si la conexión es a través de un Pooler (ej: Supavisor en puerto 6543).
 * Los poolers de transacción no soportan sentencias preparadas (PREPARE).
 */
const isPooler = env.DATABASE_URL.includes(':6543');

if (!isTest) {
  const logger = new Logger('DatabaseClient');
  logger.log(
    `🐘 Inicializando conexión DB. Modo: ${isPooler ? 'POOLER (Transaction)' : 'DIRECT (Session)'}. SSL: True.`
  );
}

// Configuración optimizada para Serverless
const client = postgres(env.DATABASE_URL, {
  prepare: !isPooler, // Desactivar prepare si es pooler
  ssl: { rejectUnauthorized: false }, // Necesario para Supabase/AWS en algunos contextos
  max: isPooler ? 20 : 5, // Más conexiones si es pooler, menos si es directo
  idle_timeout: 20, // Cerrar conexiones ociosas rápido en serverless
  connect_timeout: 10,
});

// Exportación de la instancia Singleton con el esquema completo tipado
export const db = drizzle(client, {
  schema,
  // En desarrollo, logger de queries para debugging visual
  logger: env.NODE_ENV === 'development',
});
