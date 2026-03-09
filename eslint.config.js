import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly'
      }
    },
    rules: {
      "no-console": "warn",
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "no-var": "error",
      "prefer-const": "warn",
      "semi": ["warn", "always"],
      "quotes": ["warn", "single"],
      "indent": ["warn", 2],
      "comma-dangle": ["warn", "always-multiline"],
      "eqeqeq": ["warn", "always"]
    }
  }
];