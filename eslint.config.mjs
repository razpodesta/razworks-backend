// INICIO DEL ARCHIVO [eslint.config.mjs]
/**
 * @fileoverview CONSTITUCIÓN MAESTRA DE LINTING (FLAT CONFIG)
 * @description Define las fronteras arquitectónicas y reglas globales.
 * @standard RAZWORKS-AUDIT-V6 (Updated Permissions)
 */
import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/node_modules', '**/.next', '**/.swc', '**/coverage'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              // BACKEND GATEWAY (API)
              sourceTag: 'scope:api',
              onlyDependOnLibsWithTags: [
                'scope:core',
                'scope:shared',
                'scope:infra',
                'scope:dtos',
                'scope:logging',
                'scope:whatsapp',
                'scope:toolbox',
                'scope:gamification', // ✅ PERMISO CONCEDIDO
                'scope:notifications' // ✅ PERMISO CONCEDIDO
              ]
            },
            {
              // FRONTEND CONSOLE
              sourceTag: 'scope:admin',
              onlyDependOnLibsWithTags: [
                'scope:ui', 'scope:shared', 'scope:dtos', 'platform:web',
                'scope:toolbox', 'scope:infra'
              ]
            },
            {
              // MICROSERVICE: WHATSAPP
              sourceTag: 'scope:whatsapp',
              onlyDependOnLibsWithTags: [
                'scope:shared', 'scope:dtos', 'scope:logging',
                'scope:infra', 'scope:toolbox', 'scope:notifications', 'type:ai'
              ]
            },
            {
              // GAMIFICATION ENGINE
              sourceTag: 'scope:gamification',
              onlyDependOnLibsWithTags: [
                'scope:infra',         // Database Access
                'scope:notifications', // Alert Dispatch
                'scope:shared',        // Utils
                'scope:dtos'           // Shared Types
              ]
            },
            {
              // NOTIFICATIONS ENGINE
              sourceTag: 'scope:notifications',
              onlyDependOnLibsWithTags: [
                'scope:infra',  // Database Access
                'scope:shared', // Utils
                'scope:dtos'    // DTOs
              ]
            },
            {
              // DOMAIN CORE (THE KING)
              sourceTag: 'scope:core',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:dtos']
            },
            {
              // INFRASTRUCTURE (ADAPTERS)
              sourceTag: 'scope:infra',
              onlyDependOnLibsWithTags: [
                'scope:core',    // HEXAGONAL: Permite implementar Puertos
                'scope:shared', 'scope:dtos', 'scope:logging', 'scope:infra'
              ]
            },
            {
              // SHARED KERNEL
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:dtos']
            },
            {
              // UI SYSTEM
              sourceTag: 'scope:ui',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:dtos']
            },
            {
              // BUSINESS TOOLBOX
              sourceTag: 'scope:toolbox',
              onlyDependOnLibsWithTags: ['scope:core', 'scope:shared', 'scope:dtos', 'scope:toolbox']
            }
          ],
        },
      ],
      // --- REGLAS DE ORO ---
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    },
  },
  {
    files: ['jest.config.ts', 'jest.config.js', '*.config.ts', '*.config.js'],
    rules: {
      '@nx/enforce-module-boundaries': 'off',
    },
  },
];
// FIN DEL ARCHIVO [eslint.config.mjs]
