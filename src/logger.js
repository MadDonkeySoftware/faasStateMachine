/* eslint-disable no-unused-vars */
const {
  createLogger, format, transports, Logger,
} = require('winston');
/* eslint-enable no-unused-vars */

/**
 * Creates a new logger object.
 * @param {string} serviceName Optional name to give the logger.
 * @returns {Logger} the logger object
 */
const buildLogger = (serviceName) => {
  const logger = createLogger({
    level: 'info',
    format: format.combine(
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss.SSS',
      }),
      format.errors({ stack: true }),
      format.splat(),
      format.json(),
    ),
    defaultMeta: { service: serviceName || 'fnStateMachine-logger' },
    transports: [
      //
      // - Write to all logs with level `info` and below to `quick-start-combined.log`.
      // - Write all logs error (and below) to `quick-start-error.log`.
      //
      new transports.File({ filename: './logs/quick-start-error.log', level: 'error' }),
      new transports.File({ filename: './logs/quick-start-combined.log' }),
    ],
  });

  //
  // If we're not in production then **ALSO** log to the `console`
  // with the colorized simple format and a debug file for tail.
  //
  if (process.env.NODE_ENV !== 'production') {
    logger.level = 'verbose';
    logger.add(new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple(),
      ),
      level: 'silly',
    }));
    logger.add(new transports.File({
      filename: './logs/quick-start-debug.log',
      format: format.simple(),
      level: 'silly',
    }));
  }

  logger.debug('Created new logger.');

  return logger;
};

module.exports = {
  buildLogger,
};