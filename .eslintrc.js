module.exports = {
  root: true,
  extends: ['satya164', 'standard', 'prettier'],
  plugins: ['simple-import-sort', 'react', 'react-native', 'jest', '@typescript-eslint'],
  settings: {
    'react': {
      version: '16',
    },
    'import-x/core-modules': ['@calendar-kit/app', '@calendar-kit/core'],
  },
  env: {
    'react-native/react-native': true,
    'jest/globals': true,
  },
  rules: {
    'no-restricted-imports': ['error', { patterns: ['@calendar-kit/*/*'] }],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-types': 'off',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'object-shorthand': 'error',
    'curly': ['error', 'all'],
    'no-case-declarations': 'error',
    'react/jsx-uses-vars': 'error',
    'react/jsx-uses-react': 'error',
    'no-use-before-define': 'off',
    'no-unreachable': 'error',
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/prefer-to-have-length': 'warn',
    'jest/valid-expect': 'error',
    'react/react-in-jsx-scope': 'off',
    'camelcase': 'off',
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
      },
      extends: ['plugin:@typescript-eslint/recommended-type-checked'],
      rules: {
        '@eslint-react/web-api/no-leaked-event-listener': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/ban-ts-comment': [
          'error',
          {
            'ts-ignore': 'allow-with-description',
            'ts-expect-error': 'allow-with-description',
          },
        ],
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/no-var-requires': 'warn',
        '@typescript-eslint/consistent-type-exports': [
          'error',
          { fixMixedExportsWithInlineTypeSpecifier: false },
        ],
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-duplicate-type-constituents': 'error',
        '@typescript-eslint/no-shadow': 'error',
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/no-misused-promises': 'off',
        '@eslint-react/hooks-extra/no-direct-set-state-in-use-effect': 'off',
        '@eslint-react/no-array-index-key': 'off',
      },
    },
  ],
};
