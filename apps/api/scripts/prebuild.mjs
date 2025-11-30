/**
 * @fileoverview RAZWORKS API PRE-BUILD SEQUENCE (CLOUD-NATIVE EDITION)
 * @description
 * Script de validación "Pre-flight".
 * REFACTORIZADO: Soporta entornos Serverless (Render/Docker) donde .env no existe físicamente.
 */

import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';

// Configuración Visual
const C = {
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

async function preflight() {
  console.log(`\n${C.bold}${C.cyan}🚀 RAZWORKS API PRE-FLIGHT CHECK${C.reset}`);
  console.log(`${C.cyan}===========================================${C.reset}`);

  const isProduction = process.env.NODE_ENV === 'production';
  const envPath = path.resolve(process.cwd(), '.env');

  // 1. Verificación de Archivo .env (Solo Local)
  if (!isProduction && !fs.existsSync(envPath)) {
    console.error(`${C.red}❌ [FATAL] No se encuentra el archivo .env en la raíz.${C.reset}`);
    console.error(`   En desarrollo local, este archivo es obligatorio.`);
    process.exit(1);
  } else if (!fs.existsSync(envPath)) {
    console.log(`${C.yellow}ℹ️  [CLOUD] Ejecutando en entorno sin archivo .env físico. Confiando en variables de sistema.${C.reset}`);
  }

  // 2. Validación de Variables Críticas (Fail Fast)
  const CRITICAL_VARS = [
    'DATABASE_URL',
    'GOOGLE_AI_KEY',
    'ENCRYPTION_KEY',
    'SIGNING_SECRET'
  ];

  // Filtramos las que faltan en process.env
  const missing = CRITICAL_VARS.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error(`${C.red}❌ [FATAL] Variables de entorno faltantes en memoria:${C.reset}`);
    missing.forEach(k => console.error(`   - ${k}`));
    console.error(`\n   Configura estas variables en el Dashboard de Render/Vercel.`);
    process.exit(1);
  }

  // 3. Validación de Formato de DB (Protocolo 004)
  const dbUrl = process.env.DATABASE_URL || '';
  if (dbUrl.includes('pooler') && dbUrl.includes('6543')) {
     console.log(`${C.green}✅ [DB] Conexión Pooler detectada (Optimizado para Producción).${C.reset}`);
  } else if (isProduction) {
     console.warn(`${C.yellow}⚠️  [WARNING] Usando conexión directa (Puerto 5432) en Producción.${C.reset}`);
     console.warn(`   Considera cambiar a Transaction Pooler (Puerto 6543) para escalar.`);
  }

  console.log(`${C.green}✅ Pre-flight superado. Iniciando NestJS Kernel...${C.reset}\n`);
}

preflight();
