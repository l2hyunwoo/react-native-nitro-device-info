module.exports = {
  preset: 'react-native-harness',
  testMatch: ['**/__tests__/**/*.harness.(ts|tsx)'],
  // Force sequential test execution - device can only run one test suite at a time
  maxWorkers: 1,
};
