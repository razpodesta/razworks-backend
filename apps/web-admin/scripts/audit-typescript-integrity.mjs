// RUTA: scripts/audit-typescript-integrity.mjs
// VERSIÓN: 4.1 - Post-Decoupling Cleanup
// DESCRIPCIÓN: Se elimina la verificación de 'cms-admin' ya que el proyecto
//              ha sido desacoplado del monorepo.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const C = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

/**
 * Lee y parsea JSON/JSONC de forma robusta.
 */
function readConfig(filePath) {
  try {
    const absolutePath = path.resolve(ROOT_DIR, filePath);
    if (!fs.existsSync(absolutePath)) return undefined;
    const content = fs.readFileSync(absolutePath, 'utf8');
    return new Function('return ' + content)();
  } catch (error) {
    return { __error: error.message };
  }
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

// --- REGLAS COMUNES ---
const EXTENDS_BASE = {
  key: 'extends',
  match: (val) => val && val.includes('tsconfig.base.json'),
  desc: 'Hereda de tsconfig.base.json'
};
const EXTENDS_LOCAL = {
  key: 'extends',
  match: (val) => val === './tsconfig.json',
  desc: 'Hereda de ./tsconfig.json'
};
const IS_BUNDLER = {
  key: 'compilerOptions.moduleResolution',
  value: 'bundler',
  desc: 'moduleResolution: bundler'
};

// --- DEFINICIÓN DE OBJETIVOS (TARGETS) ---
const TARGETS = [
  // 1. LA CONSTITUCIÓN (Base)
  {
    path: 'tsconfig.base.json',
    type: 'ROOT',
    rules: [
      { key: 'compilerOptions.strict', value: true, desc: 'Strict Mode activado' },
      {
        key: 'compilerOptions.paths',
        check: (paths) => {
          if (!paths) return false;
          // Verificar que NO existan los muertos
          const hasDead = paths['@razpodesta/auth-shield'] || paths['@razpodesta/protocol-33'];
          // Verificar que existan los vivos
          const hasLive = paths['@/*'] && paths['@metashark-cms/ui'];
          return !hasDead && !!hasLive;
        },
        desc: 'Paths limpios (Sin Backend, Con Frontend)'
      }
    ]
  },
  // 2. LA RAÍZ (Referencias)
  {
    path: 'tsconfig.json',
    type: 'ROOT',
    rules: [
      {
        key: 'references',
        check: (refs) => {
          if (!Array.isArray(refs)) return false;
          const paths = refs.map(r => r.path);
          // CORRECCIÓN: No debe incluir cms-api NI cms-admin
          return !paths.includes('./apps/cms-api') && !paths.includes('./apps/cms-admin') && paths.includes('./apps/web-admin');
        },
        desc: 'Referencias de proyecto actualizadas (Solo Frontend)'
      }
    ]
  },
  // 3. APPS (Portfolio Web)
  {
    path: 'apps/web-admin/tsconfig.json',
    type: 'APP',
    rules: [EXTENDS_BASE, IS_BUNDLER]
  },
  // --- ELIMINADO: APPS (CMS Admin) ---

  // 5. LIBRERÍA UI (React) - Main
  {
    path: 'packages/cms/ui/tsconfig.json',
    type: 'LIB-REACT',
    rules: [
      EXTENDS_BASE,
      IS_BUNDLER,
      { key: 'compilerOptions.jsx', value: 'react-jsx', desc: 'JSX: react-jsx' }
    ]
  },
  // 6. LIBRERÍA UI - Lib (Build)
  {
    path: 'packages/cms/ui/tsconfig.lib.json',
    type: 'LIB-BUILD',
    rules: [
      EXTENDS_LOCAL,
      { key: 'compilerOptions.outDir', match: (v) => v.includes('dist/out-tsc'), desc: 'Output Directory correcto' }
    ]
  },
  // 7. LIBRERÍA UI - Spec (Test)
  {
    path: 'packages/cms/ui/tsconfig.spec.json',
    type: 'LIB-TEST',
    rules: [
      EXTENDS_LOCAL,
      { key: 'compilerOptions.types', check: (v) => v.includes('jest') && v.includes('react'), desc: 'Tipos: jest, react' }
    ]
  },
  // 8. TESTING UTILS
  {
    path: 'packages/testing-utils/tsconfig.json',
    type: 'LIB-UTIL',
    rules: [EXTENDS_BASE, IS_BUNDLER]
  },
  // 9. TESTS ROOT
  {
    path: 'tests/tsconfig.json',
    type: 'TEST-ROOT',
    rules: [
      { key: 'compilerOptions.baseUrl', value: '..', desc: 'BaseUrl apunta a la raíz' }
    ]
  }
];

async function runAudit() {
  console.log(`\n${C.cyan}${C.bold}🛡️  AUDITORÍA DE INTEGRIDAD FRONTEND (v4.1)${C.reset}`);
  console.log(`${C.dim}    Verificando pureza estructural...${C.reset}\n`);

  let totalErrors = 0;
  let filesChecked = 0;

  for (const target of TARGETS) {
    const config = readConfig(target.path);

    if (config === undefined) {
      console.log(`${C.red}✖ [MISSING] ${target.path}${C.reset}`);
      totalErrors++;
      continue;
    }

    if (config.__error) {
      console.log(`${C.red}✖ [INVALID] ${target.path}${C.reset}`);
      console.log(`   ${C.red}↳ ${config.__error}${C.reset}`);
      totalErrors++;
      continue;
    }

    filesChecked++;
    const relativePath = target.path;

    let fileErrors = 0;
    const errorDetails = [];

    for (const rule of target.rules) {
      const actualValue = getNestedValue(config, rule.key);
      let passed = false;

      if (rule.check) {
        passed = rule.check(actualValue);
      } else if (rule.match) {
        passed = rule.match(actualValue, target.path);
      } else {
        passed = actualValue === rule.value;
      }

      if (!passed) {
        fileErrors++;
        errorDetails.push({
          rule: rule.desc,
          expected: rule.value || '(Custom Check)',
          received: actualValue
        });
      }
    }

    if (fileErrors > 0) {
      totalErrors += fileErrors;
      console.log(`${C.red}✖ ${relativePath} (${target.type})${C.reset}`);
      errorDetails.forEach(d => {
        console.log(`   ${C.red}FALLO:${C.reset} ${d.rule}`);
        console.log(`     Esperado: ${C.green}${d.expected}${C.reset}`);
        console.log(`     Recibido: ${C.red}${JSON.stringify(d.received)}${C.reset}`);
      });
      console.log('');
    } else {
      console.log(`${C.green}✔ ${relativePath}${C.reset}`);
    }
  }

  console.log(`${C.dim}--------------------------------------------------${C.reset}`);

  if (totalErrors === 0) {
    console.log(`${C.green}${C.bold}✨ SISTEMA LIMPIO Y PURO.${C.reset}`);
    console.log(`${C.green}   ${filesChecked} archivos de configuración verificados sin errores.${C.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${C.red}${C.bold}💥 SE DETECTARON ${totalErrors} ERRORES DE CONFIGURACIÓN.${C.reset}`);
    console.log(`${C.red}   Revisa los logs anteriores y corrige los tsconfig.${C.reset}\n`);
    process.exit(1);
  }
}

runAudit();
