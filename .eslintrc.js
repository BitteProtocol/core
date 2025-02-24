module.exports = {
  root: true,
  // This tells ESLint to load the config from the package `eslint-config-bitte`
  extends: ["bitte"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
};
