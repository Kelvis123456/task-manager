module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'js/models/**/*.js',
    'js/services/**/*.js',
    'js/utils/**/*.js',
    'js/eventBus.js',
  ],
  coverageReporters: ['text', 'lcov'],
};
