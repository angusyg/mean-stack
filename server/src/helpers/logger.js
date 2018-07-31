/**
 * @fileoverview App main and debug logger
 * @module helpers/logger
 * @requires {@link external:fs}
 * @requires {@link external:pino}
 * @requires {@link external:pino-debug}
 * @requires {@link external:pino-multi-stream}
 * @requires {@link external:debug}
 * @requires config/logger
 */

const fs = require('fs');
const pino = require('pino');
const multistream = require('pino-multi-stream').multistream;
const config = require('../config/logger');

/**
 * Creates streams depending current execution environment
 * @function getStreams
 * @private
 * @param  {external:Error}     req  - Request received
 * @param  {external:Response}  res  - Response to be send
 * @param  {nextMiddleware}     next - Callback to pass control to next middleware
 */
function getStreams() {
  const streams = [];
  if (process.env.NODE_ENV === 'test') return streams;
  if (process.env.NODE_ENV === 'development') {
    streams.push({
      level: config.debugLevel,
      stream: process.stderr,
    });
    streams.push({
      level: config.debugLevel,
      stream: fs.createWriteStream(config.debugFile, { flag: 'a' }),
    });
  }
  streams.push({
    level: config.logLevel,
    stream: fs.createWriteStream(config.logFile, { flag: 'a' }),
  });
  return streams;
}

/**
 * Exports logger
 * @private
 * @returns {Object}  logger
 */
const logger = pino({ level: config.debugLevel }, multistream(getStreams()));

module.exports = logger;
