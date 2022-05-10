module.exports = {
  env: {
    es2021: true,
    node: true
  },
  extends: [
    'standard'
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
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': 'error',
    'no-dupe-class-members': 'off',
    '@typescript-eslint/no-dupe-class-members': 'error'
  },
  overrides: [
    {
      files: ['src/renderer/**'],
      env: {
        browser: true,
        es2021: true,
        node: true
      },
      extends: [
        'plugin:vue/essential',
        'standard'
      ],
      parserOptions: {
        ecmaVersion: 'latest',
        parser: '@typescript-eslint/parser',
        sourceType: 'module'
      },
      plugins: [
        'vue',
        '@typescript-eslint'
      ],
      rules: {
        'vue/multi-word-component-names': 'off'
      }
    }
  ]
}
