// INICIO DEL ARCHIVO [apps/api/eslint.config.mjs]
import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    // ✅ SEGURIDAD: Validar que los imports existan en package.json
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: ['{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}'],
        },
      ],
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
];
