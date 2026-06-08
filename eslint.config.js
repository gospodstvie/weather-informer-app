const js = require("@eslint/js");

module.exports = [
  {
    ignores: ["node_modules/**", "scripts/**"]
  },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        window: "readonly",
        document: "readonly",
        Chart: "readonly",
        localStorage: "readonly",
        fetch: "readonly",
        console: "readonly",
        process: "readonly",
        module: "readonly",
        require: "readonly",
        __dirname: "readonly",
        URL: "readonly",
        AbortSignal: "readonly"
      }
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }]
    }
  },
  {
    files: ["client/**/*.js"],
    languageOptions: {
      sourceType: "script",
      globals: {
        window: "readonly",
        document: "readonly",
        Chart: "readonly",
        localStorage: "readonly",
        fetch: "readonly",
        weatherApi: "readonly",
        weatherUi: "readonly",
        weatherState: "readonly"
      }
    },
    rules: {
      "no-redeclare": "off"
    }
  }
];
