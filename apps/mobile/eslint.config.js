// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'ios/*', 'android/*'],
  },
  {
    // jest.mock() factories are hoisted above imports by babel-plugin-jest-hoist,
    // so mocks must be written before the imports they replace.
    files: ['**/__tests__/**/*.ts', '**/__tests__/**/*.tsx', 'jest.setup.ts'],
    rules: {
      'import/first': 'off',
    },
  },
]);
