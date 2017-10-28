const winston = require('winston');
const slack = require('winston-slack-hook');
const tsFormat = () => (new Date()).toLocaleTimeString();

const log = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      level: 'debug',
      timestamp: tsFormat,
      handleExceptions: true,
      json: false,
      colorize: true
    }),
    new slack({
      hookUrl: 'https://hooks.slack.com/services/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',
      username: 'jeeves',
      channel: '#softball',
      formatter: (options) => {
        let message = options.message;
        const level = options.level;
        message = `${tsFormat()} ${level} ${message}`;
        return message;
      },
      colors: {
        warn: 'warning',
        error: 'danger',
        info: 'good',
        debug: '#bbddff'
      }
    })
  ]
});

module.exports = log;

module.exports.stream = {
  write: (message, encoding) => {
    log.info(message);
  }
};
