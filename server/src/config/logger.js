/**
 * @fileoverview App logger configuration
 * @module config/logger
 * @requires {@link external:path}
 * @requires {@link external:fs}
 */

const path = require('path');
const fs = require('fs');

// Creates log folder if it does not exists
const logFolder = process.env.LOG_FOLDER || path.join(__dirname, '..', '..', 'logs');
if (!fs.existsSync(logFolder)) fs.mkdirSync(logFolder);

/**
 * Application logger configuration
 * @namespace
 */
const logger = {
  /**
   * Minimal log level
   * @type {string}
   * @default info
   * @inner
   */
  logLevel: process.env.LOG_LEVEL || 'info',

  /**
   * Server log file
   * @type {string}
   * @inner
   */
  logFile: path.join(logFolder, 'server.log'),

  /**
   * Debug log file
   * @type {string}
   * @inner
   */
  debugFile: path.join(logFolder, 'debug.log'),

  /**
   * Minimal debug level
   * @type {string}
   * @default debug
   * @inner
   */
  debugLevel: 'debug',

  /**
   * Debug base namespace
   * @type {string}
   * @default nean:
   * @inner
   */
  debugBaseNs: 'nean:',

  /**
   * Default mapping between debug namespaces and level
   * @type {string}
   * @default { 'nean:*': 'debug' }
   * @inner
   */
  debugMapNs: { 'nean:*': 'debug' },
};

module.exports = logger;
