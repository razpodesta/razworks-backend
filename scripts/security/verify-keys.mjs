// scripts/security/verify-keys.mjs
/**
 * @fileoverview AUDITOR DE CRIPTOGRAFÍA
 * @description Verifica la entropía y formato de las claves maestras.
 */
import 'dotenv/config';

const C = {
  green: '\x1b[32m', red: '\x1b[31m', cyan: '\x1b[36m',
  yellow: '\x1b[33m', reset: '\x1b[0m', bold: '\x1b[1m'
};

function checkKey(name, value, requiredLength = 64) {
  console.log(`\n🔍 Verificando ${C.cyan}${name}${C.reset}...`);

  if (!value) {
    console.error(`   ${C.red}❌ FALTANTE: La variable no está definida en .env${C.reset}`);
    return false;
  }

  // Soporte para rotación (Lista separada por comas)
  const keys = value.split(',');
  let valid = true;

  keys.forEach((k, index) => {
    const keyTrimmed = k.trim();
    const label = keys.length > 1 ? `Key[${index}]` : 'Key';

    if (keyTrimmed.length !== requiredLength) {
      console.error(`   ${C.red}❌ ${label} LONGITUD INCORRECTA:${C.reset}`);
      console.error(`      Esperado: ${requiredLength} caracteres (Hex)`);
      console.error(`      Recibido: ${keyTrimmed.length} caracteres`);
      valid = false;
    } else if (!/^[0-9a-fA-F]+$/.test(keyTrimmed)) {
      console.error(`   ${C.red}❌ ${label} FORMATO INVÁLIDO:${C.reset} No es hexadecimal.`);
      valid = false;
    } else {
      console.log(`   ${C.green}✅ ${label} OK (32 Bytes Hex)${C.reset}`);
    }
  });

  return valid;
}

function run() {
  console.log(`${C.bold}🛡️  RAZWORKS SECURITY AUDIT${C.reset}`);
  console.log('====================================');

  const encKey = process.env.ENCRYPTION_KEY;
  const sigKey = process.env.SIGNING_SECRET;

  let allGood = true;

  // 1. Verificar Encryption Key
  if (!checkKey('ENCRYPTION_KEY', encKey)) allGood = false;

  // 2. Verificar Signing Secret
  if (!checkKey('SIGNING_SECRET', sigKey)) allGood = false;

  // 3. Verificar que no sean iguales (Pecado Capital)
  if (encKey && sigKey && encKey.includes(sigKey)) {
    console.log(`\n${C.red}🚨 ALERTA CRÍTICA: Has usado la misma clave para Encriptar y Firmar.${C.reset}`);
    console.log(`   Esto compromete la seguridad. Genera claves distintas.`);
    allGood = false;
  }

  console.log('\n====================================');
  if (allGood) {
    console.log(`${C.green}${C.bold}✨ SISTEMA BLINDADO. CLAVES VÁLIDAS.${C.reset}\n`);
    process.exit(0);
  } else {
    console.error(`${C.red}${C.bold}💥 FALLO DE SEGURIDAD. REVISA TU .ENV${C.reset}\n`);
    process.exit(1);
  }
}

run();
