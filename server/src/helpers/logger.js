/**
 * @fileoverview App main and debug logger
 * @module helpers/logger
 * @requires {@link external:fs}
 * @requires {@link external:pino}
 * @requires {@link external:pino-multi-stream}
 * @requires config/logger
 */

const fs = require('fs');
const pino = require('pino');
const multistream = require('pino-multi-stream').multistream;
const config = require('../config/logger');

/**
 * Creates streams depending on current execution environment
 * @function getStreams
 * @private
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
      stream: fs.createWriteStream(config.debugFile, { flags: 'a' }),
    });
  }
  streams.push({
    level: config.logLevel,
    stream: fs.createWriteStream(config.logFile, { flags: 'a' }),
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
