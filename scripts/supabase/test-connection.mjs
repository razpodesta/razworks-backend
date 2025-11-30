/**
 * @fileoverview DIAGNÓSTICO MAESTRO: SUPABASE (POSTGRESQL)
 * @description
 * Prueba de conexión TCP directa a la base de datos.
 * Valida credenciales, puerto y latencia de query.
 */

import 'dotenv/config';
import postgres from 'postgres';

// --- CONFIGURACIÓN VISUAL ---
const C = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

async function runDiagnostic() {
  console.log(`\n${C.bold}${C.cyan}🐘 DIAGNÓSTICO DE BASE DE DATOS (SUPABASE)${C.reset}`);
  console.log(`${C.dim}================================================================${C.reset}`);

  // 1. VALIDACIÓN DE ENTORNO
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    console.error(`\n${C.red}❌ [FATAL] Falta DATABASE_URL en .env${C.reset}`);
    process.exit(1);
  }

  // Enmascaramiento de contraseña para log seguro
  // postgres://user:PASSWORD@host...
  const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');

  console.log(`📡 Connection String: ${maskedUrl}`);

  // Detección de Pooler vs Direct
  if (dbUrl.includes('6543')) {
    console.log(`ℹ️  Modo: ${C.green}Transaction Pooler (Puerto 6543) - Producción Ready${C.reset}`);
  } else {
    console.log(`ℹ️  Modo: ${C.yellow}Direct Connection (Puerto 5432) - Migrations Ready${C.reset}`);
  }

  // 2. INICIALIZACIÓN CLIENTE
  // Usamos 'postgres' (pnpm add postgres) que es lo que usa Drizzle bajo el capó
  const sql = postgres(dbUrl, {
    connect_timeout: 10, // 10 segundos timeout
    ssl: { rejectUnauthorized: false } // Necesario para Supabase en algunos entornos
  });

  try {
    console.log(`${C.dim}----------------------------------------------------------------${C.reset}`);
    console.log(`🔄 Iniciando Handshake TCP/SSL...`);

    const start = performance.now();

    // 3. PRUEBA DE QUERY (SELECT 1)
    const result = await sql`SELECT version() as v, current_database() as db`;

    const duration = (performance.now() - start).toFixed(2);
    const version = result[0].v;
    const dbName = result[0].db;

    console.log(`\n${C.green}${C.bold}✅ CONEXIÓN EXITOSA${C.reset}`);
    console.log(`⏱️  Latencia: ${duration}ms`);
    console.log(`🗄️  Database: ${dbName}`);
    console.log(`ℹ️  Version:  ${version.split(' ')[0]}`); // PostgreSQL 15.x...

  } catch (error) {
    console.log(`\n${C.red}${C.bold}❌ FALLO LA CONEXIÓN SQL${C.reset}`);
    console.log(`${C.dim}----------------------------------------------------------------${C.reset}`);

    const msg = error.message || 'Error desconocido';
    console.error(`${C.red}🛑 Error: ${msg}${C.reset}`);

    // DIAGNÓSTICO INTELIGENTE
    if (msg.includes('password authentication failed')) {
      console.log(`\n${C.yellow}💡 CAUSA: Contraseña incorrecta en DATABASE_URL.${C.reset}`);
    } else if (msg.includes('getaddrinfo EAI_AGAIN')) {
      console.log(`\n${C.yellow}💡 CAUSA: Host incorrecto o sin internet.${C.reset}`);
    } else if (msg.includes('ECONNREFUSED')) {
      console.log(`\n${C.yellow}💡 CAUSA: El puerto está bloqueado o la DB está caída.${C.reset}`);
    }

    process.exit(1);
  } finally {
    await sql.end();
  }
}

runDiagnostic();
