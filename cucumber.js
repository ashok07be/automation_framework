module.exports = {
  default: {
    require: ['src/steps/**/*.js'],
    requireModule: ['@babel/register'],
    format: [
      'progress-bar',
      'html:reports/cucumber-report.html',
      'json:reports/cucumber-report.json',
    ],
    formatOptions: {
      snippetInterface: 'async-await',
    },
    publish: false,
    parallel: 1,
  },
};
