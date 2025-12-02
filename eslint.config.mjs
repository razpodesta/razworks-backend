/**
 * @fileoverview CONSTITUCIÓN MAESTRA DE LINTING (FLAT CONFIG)
 * @module Config/ESLint
 * @description
 * Define las fronteras arquitectónicas (Boundaries), reglas de calidad de código
 * y excepciones estratégicas para Tests y Scripts.
 *
 * @standard RAZWORKS-FINAL-V8
 * @author Raz Podestá & LIA Legacy
 */
import nx from '@nx/eslint-plugin';

export default [
  // 1. Configuración Base de Nx (Recommended)
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],

  // 2. Ignorados Globales (Performance)
  {
    ignores: ['**/dist', '**/node_modules', '**/.next', '**/.swc', '**/coverage', '**/reports'],
  },

  // 3. Reglas Maestras (Aplicables a todo el TypeScript/JavaScript)
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      // --- A. ARQUITECTURA & LÍMITES (The Wall) ---
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            // [APP] API GATEWAY: Acceso total al Backend
            {
              sourceTag: 'scope:api',
              onlyDependOnLibsWithTags: [
                'scope:core',           // Dominio
                'scope:shared',         // DTOs, Utils
                'scope:infra',          // DB, AI, Security
                'scope:logging',        // Observabilidad
                'scope:whatsapp',       // Feature Modules
                'scope:notifications',
                'scope:gamification',
                'scope:toolbox',
                'scope:testing'         // Factories
              ]
            },
            // [APP] WEB ADMIN: Acceso restringido a UI y Contratos
            {
              sourceTag: 'scope:admin',
              onlyDependOnLibsWithTags: [
                'scope:ui',             // Componentes Visuales
                'scope:shared',         // Contratos (DTOs)
                'scope:toolbox',        // Lógica Cliente
                'scope:testing'
                // PROHIBIDO: scope:infra, scope:core (Lógica de servidor)
              ]
            },
            // [LIB] CORE DOMAIN: Soberanía total (Sin dependencias externas)
            {
              sourceTag: 'scope:core',
              onlyDependOnLibsWithTags: ['scope:shared']
            },
            // [LIB] INFRAESTRUCTURA (DB, AI, Security): Implementan puertos
            {
              sourceTag: 'scope:infra',
              onlyDependOnLibsWithTags: [
                'scope:core',     // Implementan Interfaces
                'scope:shared',
                'scope:logging',
                'scope:infra',    // Dependencias internas (AI usa DB)
                'scope:toolbox'   // AI usa Tools
              ]
            },
            // [LIB] FEATURE ENGINES (Lógica de Negocio Orquestada)
            {
              sourceTag: 'scope:whatsapp',
              onlyDependOnLibsWithTags: [
                'scope:core', 'scope:shared', 'scope:infra',
                'scope:logging', 'scope:notifications', 'scope:toolbox'
              ]
            },
            {
              sourceTag: 'scope:notifications',
              onlyDependOnLibsWithTags: ['scope:infra', 'scope:shared']
            },
            {
              sourceTag: 'scope:gamification',
              onlyDependOnLibsWithTags: ['scope:infra', 'scope:notifications', 'scope:shared', 'scope:core']
            },
            // [LIB] TOOLBOX (Herramientas)
            {
              sourceTag: 'scope:toolbox',
              onlyDependOnLibsWithTags: ['scope:core', 'scope:shared', 'scope:toolbox']
            },
            // [LIB] SHARED (DTOs, Utils, UI, Testing): Utilidades puras
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared']
            },
            {
              sourceTag: 'scope:ui',
              onlyDependOnLibsWithTags: ['scope:shared']
            },
            {
              sourceTag: 'scope:testing',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:core']
            }
          ],
        },
      ],

      // --- B. CALIDAD DE CÓDIGO (Zero-Tolerance) ---
      '@typescript-eslint/no-explicit-any': 'error', // Pilar 3: Soberanía de Tipos
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // Limpieza
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }], // Pilar 4: Observabilidad (Usar Logger)
    },
  },

  // 4. EXCEPCIONES TÁCTICAS

  // Archivos de Configuración & Scripts: Flexibilidad necesaria
  {
    files: [
      'jest.config.ts', 'jest.config.js',
      '*.config.ts', '*.config.js',
      '**/scripts/**/*.mjs', '**/scripts/**/*.ts'
    ],
    rules: {
      '@nx/enforce-module-boundaries': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      'no-console': 'off' // Los scripts de build necesitan console.log
    },
  },

  // Tests de Integración (tests/ y e2e/): Permiso para cruzar fronteras y hacer imports relativos
  {
    files: ['tests/**/*.ts', 'tests/**/*.tsx', 'apps/**/*-e2e/**/*.ts'],
    rules: {
      '@nx/enforce-module-boundaries': 'off', // Permite importar ../../../src/app/module
      '@typescript-eslint/no-unused-vars': 'off', // Permite variables mock no usadas
      '@typescript-eslint/no-explicit-any': 'off' // Permite mocks rápidos en tests sucios
    }
  }
];
