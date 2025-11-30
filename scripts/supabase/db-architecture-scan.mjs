/**
 * @fileoverview DB ARCHITECTURE SCANNER (JSON EDITION)
 * @description
 * Genera una radiografía completa y estructurada de la base de datos.
 *
 * OUTPUT: reports/latest-db-structure.json
 * FORMATO: JSON consumible por Agentes de IA.
 *
 * DATOS EXTRAÍDOS:
 * - Metadatos de Conexión
 * - Extensiones (Vector, Crypto)
 * - Esquema de Tablas (Columnas, Tipos)
 * - Seguridad (RLS Policies)
 * - Grafo de Relaciones (Foreign Keys)
 * - Automatización (Triggers)
 */

import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';

// --- CONFIGURACIÓN ---
const C = {
  reset: '\x1b[0m', green: '\x1b[32m', cyan: '\x1b[36m',
  yellow: '\x1b[33m', red: '\x1b[31m', bold: '\x1b[1m', dim: '\x1b[2m'
};

const REPORT_DIR = path.resolve('reports');
if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR);

// NOMBRE ESTÁTICO PARA SOBREESCRIBIR (Evita acumulación)
const REPORT_FILE = path.join(REPORT_DIR, 'latest-db-structure.json');

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error(`${C.red}❌ FATAL: DATABASE_URL no definida.${C.reset}`);
  process.exit(1);
}

const sql = postgres(dbUrl, { ssl: { rejectUnauthorized: false } });

// Estructura Base del Reporte JSON
const dbSnapshot = {
  meta: {
    generated_at: new Date().toISOString(),
    connection_mode: dbUrl.includes('6543') ? 'Pooler' : 'Direct',
    database_name: '',
    version: ''
  },
  extensions: [],
  tables: {},
  relations: [],
  triggers: []
};

// --- MOTORES DE ESCANEO ---

async function scanMeta() {
  const res = await sql`SELECT current_database() as db, version() as v`;
  dbSnapshot.meta.database_name = res[0].db;
  dbSnapshot.meta.version = res[0].v;
  console.log(`ℹ️  Conectado a: ${res[0].db} (${dbSnapshot.meta.connection_mode})`);
}

async function scanExtensions() {
  const exts = await sql`
    SELECT extname, extversion
    FROM pg_extension
    ORDER BY extname ASC`;

  dbSnapshot.extensions = exts.map(e => ({
    name: e.extname,
    version: e.extversion,
    is_ai_relevant: e.extname === 'vector'
  }));

  console.log(`🔌 Extensiones detectadas: ${exts.length}`);
}

async function scanTablesAndRLS() {
  // Obtenemos tablas y su estado de RLS
  const tables = await sql`
    SELECT
      t.tablename,
      c.relrowsecurity as rls_enabled,
      c.relforcerowsecurity as rls_forced
    FROM pg_tables t
    JOIN pg_class c ON t.tablename = c.relname
    WHERE t.schemaname = 'public'
    ORDER BY t.tablename;
  `;

  console.log(`📂 Escaneando ${tables.length} tablas...`);

  for (const t of tables) {
    // 1. Columnas
    const cols = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = ${t.tablename}
      ORDER BY ordinal_position`;

    // 2. Políticas RLS
    const policies = await sql`
      SELECT policyname, cmd, roles, qual, with_check
      FROM pg_policies
      WHERE tablename = ${t.tablename}`;

    // Construcción del Objeto Tabla
    dbSnapshot.tables[t.tablename] = {
      rls_enabled: t.rls_enabled,
      columns: cols.map(c => ({
        name: c.column_name,
        type: c.data_type,
        nullable: c.is_nullable === 'YES',
        default: c.column_default
      })),
      policies: policies.map(p => ({
        name: p.policyname,
        command: p.cmd,
        roles: p.roles,
        definition: p.qual
      }))
    };
  }
}

async function scanRelations() {
  const rels = await sql`
    SELECT
      tc.constraint_name,
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM
      information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema='public';
  `;

  dbSnapshot.relations = rels.map(r => ({
    constraint: r.constraint_name,
    from: `${r.table_name}.${r.column_name}`,
    to: `${r.foreign_table_name}.${r.foreign_column_name}`
  }));

  console.log(`🔗 Relaciones detectadas: ${rels.length}`);
}

async function scanTriggers() {
  const triggers = await sql`
    SELECT event_object_table, trigger_name, action_statement, action_timing, event_manipulation
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'`;

  dbSnapshot.triggers = triggers.map(t => ({
    table: t.event_object_table,
    name: t.trigger_name,
    timing: t.action_timing,
    event: t.event_manipulation,
    action: t.action_statement
  }));

  console.log(`⚡ Triggers detectados: ${triggers.length}`);
}

// --- ORQUESTADOR ---
async function run() {
  console.log(`\n${C.bold}${C.cyan}🩻 INICIANDO RADIOGRAFÍA ESTRUCTURAL...${C.reset}`);

  try {
    await scanMeta();
    await scanExtensions();
    await scanTablesAndRLS();
    await scanRelations();
    await scanTriggers();

    // Guardar Reporte JSON
    fs.writeFileSync(REPORT_FILE, JSON.stringify(dbSnapshot, null, 2));

    console.log(`\n${C.green}${C.bold}✅ SNAPSHOT GUARDADO${C.reset}`);
    console.log(`📄 Archivo: ${C.yellow}${REPORT_FILE}${C.reset}`);
    console.log(`🤖 Status: Listo para consumo por IA.\n`);

  } catch (err) {
    console.error(`\n${C.red}💥 Error crítico en el escáner:${C.reset}`, err);
  } finally {
    await sql.end();
  }
}

run();
