// RUTA: scripts/diagnosis/supabase/check-connection.ts
// VERSIÓN: 2.0 - SSL Bypass Edition
// DESCRIPCIÓN: Diagnóstico de conectividad con bypass explícito de validación de cadena SSL.
//              Esto es necesario para entornos locales conectándose a Supabase Poolers.

// --- CONFIGURACIÓN CRÍTICA SSL ---
// Desactivamos la validación estricta de certificados TLS solo para este proceso de diagnóstico.
// Esto soluciona el error "SELF_SIGNED_CERT_IN_CHAIN".
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Definición de tipo para errores de sistema/base de datos
interface SystemError extends Error {
  code?: string;
}

const colors = {
  reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m',
  yellow: '\x1b[33m', cyan: '\x1b[36m', gray: '\x1b[90m',
};

const LOG_PREFIX = `${colors.cyan}[SUPABASE-DIAG]${colors.reset}`;

function loadEnvironment() {
  const rootEnv = path.resolve(process.cwd(), '.env.local');
  const apiEnv = path.resolve(process.cwd(), 'apps/cms-api/.env');

  if (fs.existsSync(rootEnv)) {
    console.log(`${LOG_PREFIX} Cargando configuración desde: ${colors.gray}.env.local${colors.reset}`);
    dotenv.config({ path: rootEnv });
  } else if (fs.existsSync(apiEnv)) {
    console.log(`${LOG_PREFIX} Cargando configuración desde: ${colors.gray}apps/cms-api/.env${colors.reset}`);
    dotenv.config({ path: apiEnv });
  } else {
    console.warn(`${LOG_PREFIX} ${colors.yellow}⚠️ No se encontró archivo .env específico. Usando variables de sistema.${colors.reset}`);
  }
}

function maskString(str: string | undefined, visibleChars = 4): string {
  if (!str) return 'undefined';
  if (str.length <= visibleChars) return '****';
  return `${str.substring(0, visibleChars)}****${str.substring(str.length - visibleChars)}`;
}

async function runDiagnosis() {
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}   DIAGNÓSTICO DE CONEXIÓN SUPABASE   ${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  loadEnvironment();

  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error(`${LOG_PREFIX} ${colors.red}❌ ERROR CRÍTICO: No se encontró DATABASE_URL ni POSTGRES_URL.${colors.reset}`);
    process.exit(1);
  }

  console.log(`${LOG_PREFIX} Connection String: ${colors.yellow}${maskString(connectionString)}${colors.reset}`);

  const client = new Client({
    connectionString,
    // Configuración SSL permisiva para el cliente PG
    ssl: {
      rejectUnauthorized: false,
    },
    connectionTimeoutMillis: 10000, // Aumentado a 10s para latencia de red
  });

  try {
    const start = Date.now();
    console.log(`${LOG_PREFIX} Iniciando handshake TCP/SSL (Modo Permisivo)...`);

    await client.connect();

    const connectTime = Date.now() - start;
    console.log(`${LOG_PREFIX} ${colors.green}✅ Conexión establecida en ${connectTime}ms${colors.reset}`);

    console.log(`${LOG_PREFIX} Ejecutando consulta de prueba...`);
    const queryStart = Date.now();
    const res = await client.query('SELECT NOW() as time, current_database() as db_name, version() as version');
    const queryTime = Date.now() - queryStart;

    const dbInfo = res.rows[0];

    console.log(`\n${colors.green}✨ DIAGNÓSTICO EXITOSO ✨${colors.reset}`);
    console.log(`   ----------------------------------------`);
    console.log(`   📡 Latencia Query : ${colors.yellow}${queryTime}ms${colors.reset}`);
    console.log(`   🗄️  Base de Datos : ${colors.cyan}${dbInfo.db_name}${colors.reset}`);
    console.log(`   ℹ️  Versión Motor  : ${colors.gray}${dbInfo.version}${colors.reset}`);
    console.log(`   ----------------------------------------\n`);

  } catch (unknownError: unknown) {
    const err = unknownError as SystemError;
    console.error(`\n${LOG_PREFIX} ${colors.red}💥 FALLO DE CONEXIÓN:${colors.reset}`);
    console.error(`   Codigo: ${colors.yellow}${err.code || 'UNKNOWN'}${colors.reset}`);
    console.error(`   Mensaje: ${err.message}`);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runDiagnosis();
