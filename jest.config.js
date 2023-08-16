const path = require("path");

module.exports = {
  testEnvironment: "jsdom", // Use jsdom environment for DOM-related tests
  roots: ["./src"], // The root directory for running tests
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  testMatch: ["**/__tests__/**/*.js?(x)", "**/?(*.)+(spec|test).js?(x)"], // File patterns for test files
  setupFilesAfterEnv: ["@testing-library/jest-dom/extend-expect"], // Setup file to extend Jest with RTL matchers
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^src/(.*)$": path.resolve(__dirname, "src/$1"), // Add the moduleNameMapper for your alias
  },
  transformIgnorePatterns: ["/node_modules/(?!(lodash-es)/)"],
};
