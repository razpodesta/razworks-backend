/**
 * @fileoverview MASTER AUDIT: FULL STACK VERIFICATION
 * @description
 * 1. Verifica integridad de archivos .env (Backend y Frontend).
 * 2. Valida sincronización de secretos (HMAC Match).
 * 3. Ejecuta pruebas de conectividad (DB, Redis, AI).
 * 4. Valida formato de claves criptográficas.
 */

import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const C = {
  reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m',
  yellow: '\x1b[33m', cyan: '\x1b[36m', bold: '\x1b[1m'
};

const ROOT_DIR = process.cwd();
const BACKEND_ENV = path.join(ROOT_DIR, '.env');
const FRONTEND_ENV = path.join(ROOT_DIR, 'apps/web-admin/.env.local');

// Helper para leer variables específicas de un archivo
function getEnvValue(filePath, key) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf-8');
  const match = content.match(new RegExp(`^${key}="?([^"\\n]+)"?`, 'm'));
  return match ? match[1] : null;
}

function runScript(scriptPath) {
  try {
    console.log(`\n${C.cyan}▶ Ejecutando: ${scriptPath}${C.reset}`);
    execSync(`node ${scriptPath}`, { stdio: 'inherit' });
    return true;
  } catch {
    // FIX: Eliminada variable 'e' no utilizada (Optional Catch Binding)
    // El error ya se muestra en stdout debido a stdio: 'inherit'
    return false;
  }
}

async function main() {
  console.log(`${C.bold}🛡️  RAZWORKS MASTER AUDIT PROTOCOL${C.reset}`);
  console.log('=======================================');

  let errors = 0;

  // 1. VERIFICACIÓN DE ARCHIVOS DE ENTORNO
  console.log(`\n${C.bold}1. INTEGRIDAD DE CONFIGURACIÓN${C.reset}`);

  if (fs.existsSync(BACKEND_ENV)) console.log(`   ${C.green}✅ Backend .env encontrado${C.reset}`);
  else { console.log(`   ${C.red}❌ FALTANTE: .env en raíz${C.reset}`); errors++; }

  if (fs.existsSync(FRONTEND_ENV)) console.log(`   ${C.green}✅ Frontend .env.local encontrado${C.reset}`);
  else { console.log(`   ${C.red}❌ FALTANTE: apps/web-admin/.env.local${C.reset}`); errors++; }

  // 2. VERIFICACIÓN DE SINCRONIZACIÓN DE SECRETOS (HMAC)
  if (fs.existsSync(BACKEND_ENV) && fs.existsSync(FRONTEND_ENV)) {
    const backSecret = getEnvValue(BACKEND_ENV, 'SIGNING_SECRET');
    const frontSecret = getEnvValue(FRONTEND_ENV, 'SIGNING_SECRET');

    if (!backSecret || !frontSecret) {
      console.log(`   ${C.red}❌ SIGNING_SECRET falta en uno de los archivos.${C.reset}`);
      errors++;
    } else if (backSecret !== frontSecret) {
      console.log(`   ${C.red}🚨 FATAL: SIGNING_SECRET NO COINCIDE.${C.reset}`);
      console.log(`      Backend:  ${backSecret.substring(0, 6)}...`);
      console.log(`      Frontend: ${frontSecret.substring(0, 6)}...`);
      console.log(`      ${C.yellow}La comunicación Frontend -> API fallará (401 Unauthorized).${C.reset}`);
      errors++;
    } else {
      console.log(`   ${C.green}✅ SIGNING_SECRET Sincronizado (Handshake OK)${C.reset}`);
    }
  }

  // 3. AUDITORÍA DE CLAVES (Formato)
  if (!runScript('scripts/security/verify-keys.mjs')) errors++;

  // 4. PRUEBAS DE CONECTIVIDAD (Infraestructura)
  console.log(`\n${C.bold}2. CONECTIVIDAD DE INFRAESTRUCTURA${C.reset}`);

  // Supabase (Postgres)
  if (!runScript('scripts/supabase/test-connection.mjs')) errors++;

  // Upstash (Redis)
  if (!runScript('scripts/upstash/test-connection.mjs')) errors++;

  // Google AI
  if (!runScript('scripts/google-ai/test-connection.mjs')) errors++;

  // 5. RESUMEN
  console.log('\n=======================================');
  if (errors === 0) {
    console.log(`${C.green}${C.bold}✨ SISTEMA 100% OPERATIVO. LISTO PARA DEPLOY.${C.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${C.red}${C.bold}💥 SE DETECTARON ${errors} PROBLEMAS CRÍTICOS.${C.reset}`);
    console.log(`   Corrige los errores antes de subir a producción.\n`);
    process.exit(1);
  }
}

main();
