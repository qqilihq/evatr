import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginN from 'eslint-plugin-n';
// turns off the rules that would fight Prettier; Prettier itself runs as its
// own `lint:format` script rather than as an ESLint rule
import eslintConfigPrettier from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';

export default defineConfig(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginN.configs['flat/recommended'],
  eslintConfigPrettier,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      semi: ['error', 'always'],

      // not part of eslint-plugin-n's recommended set, but cheap to keep honest
      'n/prefer-node-protocol': 'error',

      // TypeScript resolves these extensionless imports; the rule resolves them
      // the way Node would and reports every one. `lint:types` already proves
      // that each import resolves.
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: true }],
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    ignores: ['dist/**', 'coverage/**', '*.config.*', '.prettierrc.js', '.ncurc.js'],
  },
);
