/**
 * @fileoverview This is API configuration values
 * @module config/api
 */

/**
 * API configuration
 * @namespace
 */
const api = {
  /**
   * Base URL for API
   * @type {string}
   * @default /api
   */
  base: '/api',

  /**
   * JWT token signature secret
   * @type {string}
   * @default DEV-JWTSecret
   */
  tokenSecretKey: process.env.TOKEN_SECRET || 'DEV-JWTSecret',

  /**
   * JWT token header name
   * @type {string}
   * @default authorization
   */
  accessTokenHeader: 'authorization',

  /**
   * JWT token expiration delay
   * @type {number}
   * @default 60 * 10
   */
  accessTokenExpirationTime: 60 * 10,

  /**
   * Refresh token header name
   * @type {string}
   * @default refresh
   */
  refreshTokenHeader: 'refresh',

  /**
   * Refresh token endpoint path
   * @type {string}
   * @default /refresh
   */
  refreshPath: '/refresh',

  /**
   * Login endpoint path
   * @type {string}
   * @default /login
   */
  loginPath: '/login',

  /**
   * Logout endpoint path
   * @type {string}
   * @default /logout
   */
  logoutPath: '/logout',

  /**
   * Logger endpoint path
   * @type {string}
   * @default /log/:level
   */
  loggerPath: '/log/:level',

  /**
   * JWT Token validation endpoint path
   * @type {string}
   * @default /validate
   */
  validateTokenPath: '/validate',

  /**
   * User possible roles
   * @type {Object}
   */
  roles: {
    ADMIN: 'ADMIN',
    USER: 'USER',
  },
};

module.exports = api;
