module.exports = {
  env: {
    es2021: true,
    node: true
  },
  extends: [
    'standard',
    'plugin:@peeky/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
  }
}
