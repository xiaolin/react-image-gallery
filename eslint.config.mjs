import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import react from "eslint-plugin-react";
import jest from "eslint-plugin-jest";
import globals from "globals";
import babelParser from "@babel/eslint-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...fixupConfigRules(
    compat.extends(
      "eslint:recommended",
      "plugin:react/recommended",
      "plugin:prettier/recommended",
      "plugin:import/errors",
      "plugin:import/warnings",
      "plugin:jsx-a11y/recommended",
      "plugin:react-hooks/recommended",
      "plugin:jest/recommended"
    )
  ),
  {
    plugins: {
      react: fixupPluginRules(react),
      jest: fixupPluginRules(jest),
    },

    languageOptions: {
      globals: {
        ...globals.browser,
      },

      parser: babelParser,
      ecmaVersion: 12,
      sourceType: "module",

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    settings: {
      react: {
        version: "detect",
      },

      "import/resolver": {
        alias: {
          map: [["src", "./src"]],
          extensions: [".ts", ".js", ".jsx", ".json"],
        },
      },
    },

    rules: {
      "react/display-name": "off",
    },
  },
  {
    files: ["**/*.js", "**/*.jsx"],

    rules: {
      "prettier/prettier": [
        "error",
        {
          trailingComma: "es5",
        },
      ],
    },
  },
];
