// eslint.config.cjs
const { FlatCompat } = require("@eslint/eslintrc");
const compat = new FlatCompat({
  baseDirectory: process.cwd(),
  recommendedConfig: true,
});

module.exports = [
  // Extiende de las reglas recomendadas de ESLint
  ...compat.extends(),
  // Patrón de archivos a ignorar (reemplaza lo que antes hacías en .eslintignore)
  {
    ignores: ["node_modules/**", "dist/**", ".env"],
  },
  // Tu configuración principal
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        jest: "readonly",
      },
    },
    rules: {
      // Aquí tus reglas personalizadas, p.e.:
      // "no-unused-vars": ["warn"],
    },
  },
];
