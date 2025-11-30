import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/node_modules', '**/.next', '**/.swc'],
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
              // API Gateway (Backend)
              sourceTag: 'scope:api',
              onlyDependOnLibsWithTags: [
                'scope:core',
                'scope:shared',
                'scope:infra',    // ✅ Permite consumir @razworks/security
                'scope:dtos',
                'scope:logging',
                'scope:whatsapp',
                'scope:toolbox'
              ]
            },
            {
              // Web Admin (Frontend)
              sourceTag: 'scope:admin',
              onlyDependOnLibsWithTags: [
                'scope:ui',
                'scope:shared',
                'scope:dtos',
                'platform:web',
                'scope:toolbox',
                'scope:infra'     // ✅ NUEVO: Permite consumir @razworks/security en Server Actions
              ]
            },
            {
              // WhatsApp Engine
              sourceTag: 'scope:whatsapp',
              onlyDependOnLibsWithTags: [
                'scope:shared',
                'scope:dtos',
                'scope:logging',
                'scope:infra',
                'scope:toolbox'
              ]
            },
            {
              // Core Domain
              sourceTag: 'scope:core',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:dtos']
            },
            {
              // Infraestructura (Database, Security, AI)
              sourceTag: 'scope:infra',
              onlyDependOnLibsWithTags: [
                'scope:shared',
                'scope:dtos',
                'scope:logging', // Infra puede loguear
                'scope:infra'    // Infra puede depender de otra Infra (ej: DB usa Security)
              ]
            }
          ],
        },
      ],
      // --- PROTOCOLO DE SOBERANÍA DE TIPOS ---
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    },
  },
];
