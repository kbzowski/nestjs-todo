/** @type {import('jest').Config} */
module.exports = {
  projects: [
    // UNIT TESTS - szybkie, z mockami
    {
      displayName: 'unit',
      testEnvironment: 'node',
      rootDir: './src',
      testRegex: '.*\\.spec\\.ts$',
      testPathIgnorePatterns: ['\\.int-spec\\.ts$'],
      transform: {
        '^.+\\.ts$': 'ts-jest',
      },
      moduleFileExtensions: ['js', 'json', 'ts'],
    },

    // INTEGRATION TESTS - serwis + baza danych
    {
      displayName: 'integration',
      testEnvironment: 'node',
      rootDir: './src',
      testRegex: '.*\\.int-spec\\.ts$',
      transform: {
        '^.+\\.ts$': 'ts-jest',
      },
      moduleFileExtensions: ['js', 'json', 'ts'],
      setupFiles: ['../jest.setup.ts'],
    },

    // API E2E TESTS - testowanie endpointów HTTP
    {
      displayName: 'api-e2e',
      testEnvironment: 'node',
      rootDir: './test',
      testRegex: '.*\\.e2e-spec\\.ts$',
      transform: {
        '^.+\\.ts$': 'ts-jest',
      },
      moduleFileExtensions: ['js', 'json', 'ts'],
      setupFiles: ['../jest.setup.ts'],
    },
  ],

  // Globalne opcje
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/**/*.int-spec.ts'],
  coverageDirectory: './coverage',
};
