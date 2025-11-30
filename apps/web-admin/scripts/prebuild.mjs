// apps/web-admin/scripts/prebuild.mjs
/**
 * @fileoverview BUILDER DE DICCIONARIOS I18N (PORTABLE & LINT-FREE)
 * @description
 * Fusiona los archivos JSON atómicos de `src/messages` en un único `src/dictionaries/[lang].json`.
 *
 * FIXES:
 * - Resuelto error ESLint: 'err' is defined but never used.
 * - Mejora: Diferenciación entre archivo faltante (ENOENT) y error de sintaxis JSON.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📍 RUTAS RELATIVAS A LA APP (apps/web-admin)
// Independiente de dónde se ejecute el comando (root o carpeta app)
const APP_ROOT = path.resolve(__dirname, '..');
const SOURCE_DIR = path.join(APP_ROOT, 'src/messages');
const DEST_DIR = path.join(APP_ROOT, 'src/dictionaries');

const LOCALES = ['en-US', 'es-ES', 'pt-BR'];

// Lista de Átomos que componen la UI
const ATOMS = [
  'app_metadata',
  'header',
  'sidebar',
  'dashboard',
  'common',
  'auth',
  'language_switcher',
  'system_status',
  'not_found',
  'server_error',
  'maintenance',
  'footer'
];

async function build() {
  console.log(`\n🏗️  [WEB-ADMIN] Generando diccionarios en: ${DEST_DIR}`);

  try {
    // Asegurar directorio destino
    await fs.mkdir(DEST_DIR, { recursive: true });

    for (const locale of LOCALES) {
      const dictionary = {};
      let missingCount = 0;

      for (const atom of ATOMS) {
        const filePath = path.join(SOURCE_DIR, locale, `${atom}.json`);

        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const json = JSON.parse(content);

          if (atom === 'app_metadata') {
             Object.assign(dictionary, json);
          } else {
             dictionary[atom] = json;
          }
        } catch (err) {
          // --- FIX LINT & MEJORA DX ---
          // Usamos la variable 'err' para dar feedback preciso
          if (err.code === 'ENOENT') {
             console.warn(`   ⚠️ [${locale}] Falta archivo '${atom}.json'. Usando objeto vacío.`);
          } else {
             // Si el error no es "no encontrado", es probable que sea un JSON malformado
             console.error(`   💥 [${locale}] Error de Sintaxis en '${atom}.json': ${err.message}`);
          }

          dictionary[atom] = {};
          missingCount++;
        }
      }

      // Escribir el artefacto final
      await fs.writeFile(
        path.join(DEST_DIR, `${locale}.json`),
        JSON.stringify(dictionary, null, 2)
      );

      const status = missingCount === 0 ? '✅ OK' : `⚠️ ${missingCount} issues`;
      console.log(`   📝 ${locale}: ${status}`);
    }

    console.log('✨ Build de i18n completado.\n');

  } catch (error) {
    console.error('💥 ERROR FATAL en Prebuild:', error);
    process.exit(1);
  }
}

build();
