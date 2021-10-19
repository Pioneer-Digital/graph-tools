const winston = require('winston');

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = winston.createLogger({
  level: process.env.LOG || 'debug',
  format: winston.format.simple(),
  // format: winston.format.json(),
  // defaultMeta: { service: 'rebalancer-service' },
  // format: myFormat,
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: 'app.log' })
    //     //
    //     // - Write all logs with level `error` and below to `error.log`
    //     // - Write all logs with level `info` and below to `combined.log`
    //     //
    //     // new winston.transports.File({ filename: 'error.log', level: 'error' }),
    //     // new winston.transports.File({ filename: 'combined.log' }),
  ],
  silent: process.env.SILENT
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//

// logger.add(new winston.transports.Console({
//   format: myFormat,
// }));

module.exports = logger