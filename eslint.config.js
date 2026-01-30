import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', '.vite', '*.cjs'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      prettier,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'prettier/prettier': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  // --- Architecture Budgets (File Line Limits) ---
  {
    files: ['components/common/**/*.{ts,tsx}'],
    rules: { 'max-lines': ['warn', { max: 110, skipBlankLines: true, skipComments: true }] },
  },
  {
    files: ['components/features/**/*.{ts,tsx}', 'components/portal/**/*.{ts,tsx}'],
    rules: { 'max-lines': ['warn', { max: 400, skipBlankLines: true, skipComments: true }] },
  },
  {
    files: ['components/pages/**/*.{ts,tsx}', 'components/templates/**/*.{ts,tsx}'],
    rules: { 'max-lines': ['warn', { max: 450, skipBlankLines: true, skipComments: true }] },
  },
  {
    files: ['components/sections/**/*.{ts,tsx}'],
    rules: { 'max-lines': ['warn', { max: 400, skipBlankLines: true, skipComments: true }] },
  },
  {
    files: ['components/layout/**/*.{ts,tsx}', 'components/visuals/**/*.{ts,tsx}'],
    rules: { 'max-lines': ['warn', { max: 250, skipBlankLines: true, skipComments: true }] },
  },
  {
    files: ['components/articles/**/*.{ts,tsx}'],
    rules: { 'max-lines': ['warn', { max: 400, skipBlankLines: true, skipComments: true }] },
  },
  {
    files: ['hooks/**/*.{ts,tsx}', 'services/**/*.{ts,tsx}'],
    rules: { 'max-lines': ['warn', { max: 200, skipBlankLines: true, skipComments: true }] },
  },
  {
    files: ['data/**/*.{ts,tsx}'],
    rules: { 'max-lines': ['warn', { max: 500, skipBlankLines: true, skipComments: true }] },
  },
  {
    files: ['utils/**/*.{ts,tsx}'],
    rules: { 'max-lines': ['warn', { max: 100, skipBlankLines: true, skipComments: true }] },
  },
  prettierConfig,
);
