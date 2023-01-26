/** @type {import('ts-jest').JestConfigWithTsJest} */
// eslint-disable-next-line no-undef
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  coverageThreshold: {
    global: {
      statements: 100,
      branches: 100,
    }
  }
};
