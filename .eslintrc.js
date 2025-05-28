module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    // aquí puedes ajustar reglas, p. ej.:
    // 'no-unused-vars': ['warn'],
  },
};
