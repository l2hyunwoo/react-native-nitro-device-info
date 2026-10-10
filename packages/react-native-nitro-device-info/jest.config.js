/** @type {import('jest').Config} */
module.exports = {
  preset: '@react-native/jest-preset',
  rootDir: '.',
  roots: ['<rootDir>/src'],
  setupFiles: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
  moduleNameMapper: {
    '^react-native-nitro-device-info$': '<rootDir>/src/index.ts',
  },
  modulePathIgnorePatterns: ['<rootDir>/lib/'],
};
