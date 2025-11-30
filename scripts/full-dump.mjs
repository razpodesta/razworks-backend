/**
 * @fileoverview DATA DUMP & SNAPSHOT
 * @description Vuelca el contenido completo de la base de datos y caché a JSON.
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';
import { Redis } from '@upstash/redis';

const REPORT_DIR = path.resolve('reports');
if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR);
const REPORT_FILE = path.join(REPORT_DIR, '03-full-data-dump.json');

async function dumpDB() {
  console.log('⏳ Dumping Supabase DB...');
  if (!process.env.DATABASE_URL) return null;

  const sql = postgres(process.env.DATABASE_URL);
  const dump = {};

  try {
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'`;

    for (const t of tables) {
      const rows = await sql`SELECT * FROM ${sql(t.table_name)}`;
      dump[t.table_name] = rows;
      console.log(`  ✓ Table '${t.table_name}': ${rows.length} rows`);
    }
    return dump;
  } catch (e) {
    console.error(`  ❌ Error DB: ${e.message}`);
    return { error: e.message };
  } finally {
    await sql.end();
  }
}

async function dumpRedis() {
  console.log('⏳ Dumping Upstash Redis...');
  if (!process.env.UPSTASH_REDIS_REST_URL) return null;

  const redis = Redis.fromEnv();
  const dump = {};

  try {
    const keys = await redis.keys('*');
    if (keys.length === 0) return {};

    // MGET para traer valores (Redis básico strings)
    // Para estructuras complejas (Hash/List) esto requeriría TYPE checking
    // Asumimos Strings/JSON para este dump simple
    for (const key of keys) {
        const type = await redis.type(key);
        let value;
        if (type === 'string') value = await redis.get(key);
        else if (type === 'hash') value = await redis.hgetall(key);
        else if (type === 'list') value = await redis.lrange(key, 0, -1);
        else value = `[Complex Type: ${type}]`;

        dump[key] = value;
    }
    console.log(`  ✓ Redis Keys: ${keys.length}`);
    return dump;
  } catch (e) {
    console.error(`  ❌ Error Redis: ${e.message}`);
    return { error: e.message };
  }
}

async function run() {
  const fullDump = {
    timestamp: new Date().toISOString(),
    database: await dumpDB(),
    cache: await dumpRedis(),
    ai: {
        note: "AI Models are stateless. No user data to dump."
    }
  };

  fs.writeFileSync(REPORT_FILE, JSON.stringify(fullDump, null, 2));
  console.log(`\n💾 Dump completo guardado en: ${REPORT_FILE}`);
}

run();
