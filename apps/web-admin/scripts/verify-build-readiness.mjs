import fs from 'fs';
import path from 'path';

const REQUIRED_FILES = [
  'apps/web-admin/src/config/i18n.config.ts',
  'apps/web-admin/next.config.js',
  'apps/cms-api/vercel.json',
  'pnpm-lock.yaml'
];

console.log('🔍 Iniciando verificación de pre-despliegue...\n');

let errorCount = 0;

REQUIRED_FILES.forEach(file => {
  if (!fs.existsSync(path.resolve(process.cwd(), file))) {
    console.error(`❌ FALTANTE: ${file}`);
    errorCount++;
  } else {
    console.log(`✅ EXISTE: ${file}`);
  }
});

console.log('\n🔍 Verificando entorno...');
if (!process.env.CI && !process.env.VERCEL) {
    console.log('ℹ️  Ejecutando en entorno local.');
} else {
    console.log('🚀 Ejecutando en entorno CI/CD.');
}

if (errorCount > 0) {
  console.error(`\n💥 Fallo de verificación. ${errorCount} problemas encontrados.`);
  process.exit(1);
} else {
  console.log('\n✨ El sistema parece listo para el build.');
  process.exit(0);
}
