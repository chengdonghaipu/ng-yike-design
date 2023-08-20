module.exports = {
  extends: '../../../design-doc/.eslintrc.json',
  ignorePatterns: ['!**/*'],
  overrides: [
    {
      files: ['*.ts'],
      rules: {}
    },
    {
      files: ['*.html'],
      rules: {}
    }
  ]
};