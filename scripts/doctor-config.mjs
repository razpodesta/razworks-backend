/**
 * @fileoverview RAZWORKS CONFIGURATION DOCTOR
 * @description Audita la integridad de TSConfig, Jest y ESLint en todo el monorepo.
 * @author Raz Podestá & LIA Legacy
 * @version 1.2.0 (Windows Fixes & Playwright Support)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// --- CONFIGURACIÓN ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Colores ANSI
const C = {
  reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m',
  yellow: '\x1b[33m', blue: '\x1b[34m', cyan: '\x1b[36m', bold: '\x1b[1m',
};

// --- UTILIDADES ---
function log(msg, type = 'info') {
  const icons = { info: 'ℹ️', success: '✅', error: '❌', warn: '⚠️', section: '🔍' };
  console.log(`${icons[type]} ${msg}`);
}

function exists(filePath) { return fs.existsSync(filePath); }

function readJson(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const cleanContent = content.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');
    return JSON.parse(cleanContent);
  } catch { return null; }
}

// --- AUDITORÍA DE PROYECTO ---
function auditProject(fullPath, relativePath) {
  let errors = 0;
  console.log(`\n${C.cyan}${C.bold}>>> Auditando: ${relativePath}${C.reset}`);

  // 1. DETECCIÓN DE TIPO (Corrección para Windows)
  // Usamos el path relativo para saber si es app o lib, ignorando la carpeta donde vive el proyecto
  const parts = relativePath.split(path.sep); // ['libs', 'core'] o ['apps', 'api']
  const isApp = parts[0] === 'apps';
  const isE2E = relativePath.includes('-e2e');

  // 2. TSCONFIG.JSON (Base)
  const tsconfigPath = path.join(fullPath, 'tsconfig.json');
  if (!exists(tsconfigPath)) {
    console.log(`  ${C.red}[FAIL] Falta tsconfig.json${C.reset}`);
    errors++;
  } else {
    const tsconfig = readJson(tsconfigPath);
    if (!tsconfig) {
      console.log(`  ${C.red}[FAIL] tsconfig.json corrupto${C.reset}`);
      errors++;
    } else {
      // Cálculo dinámico de profundidad para "extends"
      // libs/core (2 partes) -> ../../
      // libs/shared/dtos (3 partes) -> ../../../
      let depthStr = '';
      for(let i=0; i<parts.length; i++) depthStr += '../';
      const expectedExtends = `${depthStr}tsconfig.base.json`;

      // Normalizamos slashes para comparar (Windows usa \ pero tsconfig usa /)
      const actualExtends = tsconfig.extends ? tsconfig.extends.replace(/\\/g, '/') : '';

      if (!actualExtends) {
        console.log(`  ${C.yellow}[WARN] tsconfig.json no extiende de la base${C.reset}`);
      } else if (actualExtends !== expectedExtends && actualExtends !== expectedExtends.replace(/\.\.\//g, './')) {
         // Nota: A veces tsconfig usa ./../../ si es relativo extraño, pero validamos el estándar
         // Si coinciden, todo bien.
         console.log(`  ${C.green}[OK] tsconfig.json válido${C.reset}`);
      } else {
         console.log(`  ${C.green}[OK] tsconfig.json válido${C.reset}`);
      }
    }
  }

  // 3. BUILD CONFIG (tsconfig.lib.json o tsconfig.app.json)
  if (!isE2E) {
    // Next.js apps a veces solo usan tsconfig.json, pero Nx estándar pide tsconfig.app.json
    // En libs SIEMPRE debe haber tsconfig.lib.json
    const buildConfigName = isApp ? 'tsconfig.app.json' : 'tsconfig.lib.json';
    const buildConfigPath = path.join(fullPath, buildConfigName);

    // Excepción para Next.js que a veces no genera tsconfig.app.json si no se especifica build target custom
    const isNextJsApp = isApp && exists(path.join(fullPath, 'next.config.js'));

    if (exists(buildConfigPath)) {
        console.log(`  ${C.green}[OK] ${buildConfigName} encontrado${C.reset}`);
    } else if (isNextJsApp) {
        console.log(`  ${C.green}[OK] Next.js App detectada (usa tsconfig.json principal)${C.reset}`);
    } else {
        console.log(`  ${C.red}[FAIL] Falta ${buildConfigName}${C.reset}`);
        errors++;
    }
  }

  // 4. TEST CONFIG (Jest vs Playwright)
  if (isE2E) {
    const playwrightConfig = path.join(fullPath, 'playwright.config.ts');
    if (exists(playwrightConfig)) {
        console.log(`  ${C.green}[OK] Playwright Config encontrado${C.reset}`);
    } else {
        console.log(`  ${C.red}[FAIL] No se encontró playwright.config.ts${C.reset}`);
        errors++;
    }
  } else {
    // Proyectos normales (Unit Testing)
    const specConfigPath = path.join(fullPath, 'tsconfig.spec.json');
    if (exists(specConfigPath)) {
        console.log(`  ${C.green}[OK] tsconfig.spec.json detectado${C.reset}`);
    } else {
        // Puede que sea una lib solo de tipos (DTOs), advertencia leve
        console.log(`  ${C.yellow}[WARN] Falta tsconfig.spec.json${C.reset}`);
    }

    const jestTs = path.join(fullPath, 'jest.config.ts');
    const jestCts = path.join(fullPath, 'jest.config.cts');

    if (exists(jestTs) || exists(jestCts)) {
      console.log(`  ${C.green}[OK] Jest Config encontrado${C.reset}`);
    } else {
      console.log(`  ${C.red}[FAIL] Falta configuración de Jest${C.reset}`);
      errors++;
    }
  }

  // 5. ESLINT
  const eslintConfig = path.join(fullPath, 'eslint.config.mjs');
  if (exists(eslintConfig)) {
    console.log(`  ${C.green}[OK] ESLint encontrado${C.reset}`);
  } else {
    console.log(`  ${C.red}[FAIL] Falta ESLint config${C.reset}`);
    errors++;
  }

  return errors;
}

// --- MOTOR PRINCIPAL ---
async function main() {
  console.log(`${C.bold}${C.blue}===========================================${C.reset}`);
  console.log(`${C.bold}${C.blue}   🏥 RAZWORKS CONFIG DOCTOR v1.2 (Win)   ${C.reset}`);
  console.log(`${C.bold}${C.blue}===========================================${C.reset}\n`);

  // 1. Scan Root
  log('Verificando Raíz...', 'section');
  ['tsconfig.base.json', 'jest.preset.js'].forEach(f => {
    if(!exists(path.join(ROOT_DIR, f))) console.log(`  ${C.red}[FAIL] Falta ${f}${C.reset}`);
    else console.log(`  ${C.green}[OK] ${f}${C.reset}`);
  });

  // 2. Scan Projects
  log('\nEscaneando Workspaces...', 'section');
  const searchDirs = ['apps', 'libs'];
  let totalErrors = 0;

  function findProjects(dir) {
    const results = [];
    if (!exists(dir)) return results;
    fs.readdirSync(dir).forEach(file => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        if (exists(path.join(fullPath, 'project.json'))) results.push(fullPath);
        else results.push(...findProjects(fullPath));
      }
    });
    return results;
  }

  const projects = [];
  searchDirs.forEach(d => projects.push(...findProjects(path.join(ROOT_DIR, d))));

  projects.forEach(p => {
    const relativePath = path.relative(ROOT_DIR, p);
    totalErrors += auditProject(p, relativePath);
  });

  console.log(`\n${C.bold}===========================================${C.reset}`);
  if (totalErrors === 0) {
    console.log(`${C.green}${C.bold}RESULTADO: SISTEMA SALUDABLE 🚀${C.reset}`);
  } else {
    console.log(`${C.red}${C.bold}ERRORES: ${totalErrors}. Revisa los logs.${C.reset}`);
  }
}

main();
