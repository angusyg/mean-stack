/**
 * @fileoverview Security middlewares to check user authorizations
 * @module helpers/security
 * @requires helpers/passport
 * @requires models/errors
 */

const passport = require('./passport');
const { ForbiddenOperationError } = require('../models/errors');

const security = {};

/**
 * Initializes security
 * @method initialize
 */
security.initialize = () => passport.initialize();

/**
 * Checks if request is authenticated or not
 * @method requiresLogin
 */
security.requiresLogin = (req, res, next) => passport.authenticate(req, res, next);

/**
 * Call middleware with user request roles
 * @method requiresRole
 * @param   {string[]}   roles - Array of roles to call the endpoint
 * @returns {checkRole}  Middleware to check if user has role to call endpoint
 */
security.requiresRole = roles => (req, res, next) => {
  if (!roles || roles.length === 0) return next();
  if (req.user && roles.some(role => req.user.roles.includes(role))) return next();
  return next(new ForbiddenOperationError());
};

module.exports = security;
