'use strict'
const { pathsToModuleNameMapper } = require('ts-jest/utils')
const { compilerOptions } = require('./tsconfig')
module.exports = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  // TODO: when interface/types.ts will be used collect the coverage for this file
  collectCoverageFrom: ['./src/**/*.ts', '!./src/interface/types.ts'],
  coverageReporters: ['json', 'lcov', 'text'],
  clearMocks: true,
  coverageThreshold: {
    global: {
      statements: 90,
      functions: 90,
      branches: 80, // temporary go down for e2e transfer POC
      lines: 90
    }
  },
  // moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
  //   prefix: '<rootDir>/'
  // }),
  reporters: ['jest-junit', 'default']
}
