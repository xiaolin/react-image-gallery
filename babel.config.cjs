module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        // Target modern browsers that support ES modules
        targets: {
          browsers: ["> 1%", "last 2 versions", "not dead", "not ie 11"],
        },
        // Don't transform ES modules - let bundlers handle tree-shaking
        modules: false,
        // Only include polyfills that are needed
        useBuiltIns: false,
        // Use modern helpers
        bugfixes: true,
      },
    ],
    [
      "@babel/preset-react",
      {
        // Use the modern JSX transform (React 17+)
        runtime: "automatic",
      },
    ],
  ],
  // Enable caching for faster rebuilds
  env: {
    test: {
      presets: [
        ["@babel/preset-env", { targets: { node: "current" } }],
        ["@babel/preset-react", { runtime: "automatic" }],
      ],
    },
  },
};
