/**
 * @fileoverview INSPECCIÓN DE INFRAESTRUCTURA
 * @description Lista tablas, triggers, funciones y metadatos de Redis.
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';
import { Redis } from '@upstash/redis';

const REPORT_DIR = path.resolve('reports');
if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR);
const REPORT_FILE = path.join(REPORT_DIR, '02-infrastructure-structure.txt');

const logBuffer = [];
function log(msg, indent = 0) {
  const space = ' '.repeat(indent * 2);
  const line = `${space}${msg}`;
  console.log(line);
  logBuffer.push(line);
}

async function inspectDB() {
  log('\n=== 🐘 SUPABASE STRUCTURE ===');
  if (!process.env.DATABASE_URL) return log('Skipping DB...');

  const sql = postgres(process.env.DATABASE_URL);

  try {
    // 1. Tablas
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'`;

    log(`📂 Tablas Públicas (${tables.length}):`);
    for (const t of tables) {
        log(`- ${t.table_name}`, 1);
        const columns = await sql`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = ${t.table_name}`;
        columns.forEach(c => log(`  • ${c.column_name}: ${c.data_type}`, 2));
    }

    // 2. Funciones (RPC)
    const funcs = await sql`
      SELECT routine_name
      FROM information_schema.routines
      WHERE routine_schema = 'public'`;
    log(`⚡ Funciones/RPC (${funcs.length}):`);
    funcs.forEach(f => log(`- ${f.routine_name}`, 1));

    // 3. Extensiones (Check Vector)
    const extensions = await sql`SELECT extname FROM pg_extension`;
    log(`🧩 Extensiones Instaladas:`, 0);
    extensions.forEach(e => log(`- ${e.extname}`, 1));

  } catch (e) {
    log(`ERROR DB: ${e.message}`);
  } finally {
    await sql.end();
  }
}

async function inspectRedis() {
  log('\n=== 🔴 UPSTASH REDIS STATS ===');
  if (!process.env.UPSTASH_REDIS_REST_URL) return log('Skipping Redis...');

  const redis = Redis.fromEnv();
  try {
    const dbsize = await redis.dbsize();
    log(`📦 Total Keys: ${dbsize}`);

    // Obtener info de memoria si está disponible, o lista de keys (limitada)
    const keys = await redis.keys('*');
    log(`🔑 Muestra de Keys (Max 10):`);
    keys.slice(0, 10).forEach(k => log(`- ${k}`, 1));
    if(keys.length > 10) log(`... y ${keys.length - 10} más`, 1);

  } catch (e) {
    log(`ERROR REDIS: ${e.message}`);
  }
}

async function run() {
  log('INICIANDO INSPECCIÓN DE ESTRUCTURA\n');
  await inspectDB();
  await inspectRedis();

  fs.writeFileSync(REPORT_FILE, logBuffer.join('\n'));
  console.log(`\n📄 Reporte guardado en: ${REPORT_FILE}`);
}

run();
