const path = require("path");

module.exports = {
  testEnvironment: "jsdom", // Use jsdom environment for DOM-related tests
  roots: ["./src", "./example"], // The root directory for running tests
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  testMatch: [
    "**/__tests__/**/*.(js|jsx|ts|tsx)",
    "**/?(*.)+(spec|test).(js|jsx|ts|tsx)",
  ], // File patterns for test files
  setupFilesAfterEnv: [
    "@testing-library/jest-dom",
    "<rootDir>/src/setupTests.js",
  ], // Setup file to extend Jest with RTL matchers
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^src/(.*)$": path.resolve(__dirname, "src/$1"), // Add the moduleNameMapper for your alias
  },
  transformIgnorePatterns: ["/node_modules/(?!(lodash-es)/)"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
