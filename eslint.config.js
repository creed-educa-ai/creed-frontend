// ESLint flat config (ADR-003, secao 4).
// Cobre QUALIDADE de código. Formatação é 100% do Prettier — o
// eslint-config-prettier no final desliga as regras de estilo do ESLint
// para as duas ferramentas não brigarem.

import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  // .claude guarda as worktrees do Claude Code — cópias inteiras do projeto,
  // fora do tsconfig e por isso sem type information para o parser.
  { ignores: ['dist', 'coverage', 'node_modules', '.claude'] },
  {
    extends: [
      js.configs.recommended,
      // typeChecked: habilita regras que usam informação de tipo —
      // cobertura granular exigida pela referência técnica.
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
    },
  },
  {
    files: ['**/*.test.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  // SEMPRE por último: desliga regras de estilo conflitantes com o Prettier.
  prettierConfig,
);
