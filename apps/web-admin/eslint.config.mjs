import baseConfig from '../../eslint.config.mjs';
import nextPlugin from '@next/eslint-plugin-next';
import reactPlugin from 'eslint-plugin-react';
import hooksPlugin from 'eslint-plugin-react-hooks';
import nxPlugin from '@nx/eslint-plugin';

export default [
  // 1. Base Configuration (Nx Standard)
  ...baseConfig,

  // 2. Next.js & React Configuration
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    plugins: {
      '@next/next': nextPlugin,
      'react': reactPlugin,
      'react-hooks': hooksPlugin,
      '@nx': nxPlugin
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...hooksPlugin.configs.recommended.rules,
      // Reglas específicas para evitar el crash 'no-empty-function'
      '@typescript-eslint/no-empty-function': 'off',
      'react/react-in-jsx-scope': 'off', // Next.js no lo necesita
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  },

  // 3. Ignorar artefactos de build
  {
    ignores: ['.next/**/*'],
  },
];
