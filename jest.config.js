const { createDefaultPreset } = require("ts-jest");

module.exports = {
  testEnvironment: "node",
  transform: {
    ...createDefaultPreset().transform,
  },
  testMatch: ["<rootDir>/tests/unit/**/*.test.ts"],
  modulePathIgnorePatterns: ["<rootDir>/.stryker-tmp"],
  coverageDirectory: "coverage",
  collectCoverageFrom: ["src/**/*.ts", "!src/index.ts"],
  preset: 'ts-jest',
  // Formatos de reporte que generará Istanbul
  coverageReporters: ['text', 'lcov', 'clover', 'cobertura', 'json'],
};
