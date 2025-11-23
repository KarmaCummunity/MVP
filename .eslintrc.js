module.exports = {
  root: true,
  env: {
    es6: true,
    jest: true,
  },
  extends: ['@react-native-community', 'plugin:@typescript-eslint/recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    'prettier/prettier': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-empty-object-type': 'off',
    '@typescript-eslint/no-require-imports': 'off',
    'eslint-comments/no-unused-disable': 'off',
    'prefer-const': 'warn',
    'react-hooks/rules-of-hooks': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'react-native/no-inline-styles': 'off',
  },
  overrides: [
    {
      files: ['scripts/**/*.js'],
      rules: {
        'no-eval': 'off',
      },
    },
  ],
  ignorePatterns: ['node_modules/', 'dist/', '.expo/', 'web-build/'],
};
