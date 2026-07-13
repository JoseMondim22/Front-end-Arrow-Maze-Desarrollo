/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.spec.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
  moduleNameMapper: {
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@mothers/(.*)$': '<rootDir>/test/domain/_mothers/$1',
    '^@application/(.*)$': '<rootDir>/src/application/$1',
    '^@app-mothers/(.*)$': '<rootDir>/test/application/_mothers/$1',
    '^@testing-apis/(.*)$': '<rootDir>/test/application/_testing-apis/$1',
  },
  collectCoverageFrom: ['src/domain/**/*.ts', '!src/domain/**/I*.ts'],
  coverageThreshold: {
    global: { branches: 80, functions: 90, lines: 90, statements: 90 },
  },
};
