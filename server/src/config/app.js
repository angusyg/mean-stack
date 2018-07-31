/**
 * @fileoverview This is base application configuration values
 * @module config/app
 * @requires {@link external:path}
 * @requires {@link external:fs}
 */

/**
 * App configuration
 * @namespace
 */
const app = {
  /**
   * Application server port
   * @type {number}
   * @default 3000
   */
  port: process.env.PORT || 3000,

  /**
   * Salt factor for user password crypt
   * @type {number}
   * @default 10
   */
  saltFactor: 10,
};

/** Cross origin middleware configuration
 * @namespace
 */
const crossOrigin = {
  /**
   * Checks if request origin is a domain authorized
   * @function origin
   * @param  {string}          origin    - origin of request
   * @param  {nextMiddleware}  callback  - Callback to pass control to next middleware
   */
  origin(origin, callback) {
    const whitelistOrigins = [];
    if (whitelistOrigins.length === 0) callback(null, true);
    else if (whitelistOrigins.indexOf(origin) !== -1) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },

  /**
   * Allowed methods on cross origin request
   * @type {string[]}
   * @default ['GET','POST','OPTIONS','PUT','PATCH','DELETE']
   */
  methods: [
    'GET',
    'POST',
    'OPTIONS',
    'PUT',
    'PATCH',
    'DELETE',
  ],

  /**
   * Allowed headers on cross origin request
   * @type {string[]}
   * @default ['authorization','refresh','content-type']
   */
  allowedHeaders: [
    'authorization',
    'refresh',
    'content-type',
  ],

  /**
   * Credential request allowed
   * @type {boolean}
   * @default true
   */
  credentials: true,

  /**
   * Max age between cross origin OPTION request (in seconds)
   * @type {number}
   * @default 600
   */
  maxAge: 600,
};

module.exports = {
  app,
  crossOrigin,
};
