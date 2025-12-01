// INICIO DEL ARCHIVO [eslint.config.mjs]
/**
 * @fileoverview CONSTITUCIÓN MAESTRA DE LINTING (FLAT CONFIG)
 * @description Define las fronteras arquitectónicas y reglas globales.
 * @standard RAZWORKS-AUDIT-V3
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
              // BACKEND GATEWAY
              sourceTag: 'scope:api',
              onlyDependOnLibsWithTags: [
                'scope:core', 'scope:shared', 'scope:infra', 'scope:dtos',
                'scope:logging', 'scope:whatsapp', 'scope:toolbox', 'scope:gamification'
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
              // MICROSERVICE: WHATSAPP (✅ PERMISOS AMPLIADOS)
              sourceTag: 'scope:whatsapp',
              onlyDependOnLibsWithTags: [
                'scope:shared',
                'scope:dtos',
                'scope:logging',
                'scope:infra',         // Acceso a Storage/Media
                'scope:toolbox',       // Acceso a conversores
                'scope:notifications', // ✅ Acceso a Alertas (Human Handoff)
                'scope:ai'             // ✅ Acceso al Córtex
              ]
            },
            {
              // GAMIFICATION ENGINE
              sourceTag: 'scope:gamification',
              onlyDependOnLibsWithTags: [
                'scope:infra',
                'scope:notifications',
                'scope:shared',
                'scope:dtos'
              ]
            },
            {
              // DOMAIN CORE
              sourceTag: 'scope:core',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:dtos']
            },
            {
              // INFRASTRUCTURE
              sourceTag: 'scope:infra',
              onlyDependOnLibsWithTags: [
                'scope:core',
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
