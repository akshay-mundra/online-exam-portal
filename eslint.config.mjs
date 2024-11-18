import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginJest from 'eslint-plugin-jest';

export default [
  {
    files: ['**/*.js'],
    plugins: { jest: pluginJest },
    languageOptions: {
      sourceType: 'commonjs',
      globals: pluginJest.environments.globals.globals,
    },
    rules: {
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error',
    },
  },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
];
