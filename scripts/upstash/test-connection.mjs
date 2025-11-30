/**
 * @fileoverview DIAGNÓSTICO VERBOSO: UPSTASH (Redis)
 * @description Prueba de PING y operación SET/GET para validar permisos.
 */
import 'dotenv/config';
import { Redis } from '@upstash/redis';

const C = {
  green: '\x1b[32m', red: '\x1b[31m', cyan: '\x1b[36m', yellow: '\x1b[33m', reset: '\x1b[0m', bold: '\x1b[1m'
};

async function run() {
  console.log(`${C.bold}${C.cyan}🔴 INICIANDO DIAGNÓSTICO DE UPSTASH (REDIS)${C.reset}`);
  console.log('---------------------------------------------------');

  // 1. VALIDACIÓN ENV
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN; // Fallback check

  if (!url || !token) {
    console.error(`${C.red}[FATAL] Faltan credenciales UPSTASH_REDIS_REST_URL o TOKEN.${C.reset}`);
    process.exit(1);
  }

  console.log(`📡 Endpoint: ${url}`);
  console.log(`🔑 Token:    ${token.substring(0, 10)}...[REDACTED]`);
  console.log('---------------------------------------------------');

  const redis = Redis.fromEnv();

  try {
    // 2. PRUEBA DE CONECTIVIDAD (PING)
    console.log('🔄 Enviando comando PING...');
    const startPing = performance.now();
    const pong = await redis.ping();
    const durationPing = (performance.now() - startPing).toFixed(2);

    if (pong !== 'PONG') throw new Error(`Respuesta inválida: ${pong}`);
    console.log(`${C.green}✅ PING Exitoso${C.reset} (${durationPing}ms)`);

    // 3. PRUEBA DE ESCRITURA/LECTURA
    console.log('🔄 Verificando permisos de escritura (SET/GET)...');
    const testKey = 'razworks:health:check';
    const testVal = `ok_${Date.now()}`;

    await redis.set(testKey, testVal, { ex: 60 }); // Expira en 60s
    console.log(`   📝 SET ${testKey} = ${testVal}`);

    const readVal = await redis.get(testKey);
    console.log(`   📖 GET ${testKey} = ${readVal}`);

    if (readVal === testVal) {
      console.log(`\n${C.bold}${C.green}✅ SISTEMA DE CACHÉ 100% OPERATIVO${C.reset}`);
    } else {
      throw new Error('Discrepancia de datos en Redis (Write !== Read)');
    }

  } catch (e) {
    console.log(`\n${C.bold}${C.red}❌ FALLO REDIS${C.reset}`);
    console.log('---------------------------------------------------');
    console.log(`🛑 Error: ${e.message}`);
    console.log('---------------------------------------------------');
    process.exit(1);
  }
}

run();
