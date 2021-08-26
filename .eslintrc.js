module.exports = {
  root: true,
  extends: ['standard', 'prettier'],
  globals: {
    IS_DEVELOPMENT: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2020
  },
  ignorePatterns: ['public/**']
}
