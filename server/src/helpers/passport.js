/**
 * @fileoverview This is passport configuration for JWT authentication
 * @module helpers/passport
 * @requires {@link external:passport}
 * @requires {@link external:passport-jwt}
 * @requires {@link external:jsonwebtoken}
 * @requires config/api
 * @requires models/users
 * @requires models/errors
 * @requires helpers/logger
 */

const passport = require('passport');
const { Strategy, ExtractJwt } = require('passport-jwt');
const { JsonWebTokenError, TokenExpiredError } = require('jsonwebtoken');
const { tokenSecretKey } = require('../config/api');
const User = require('../models/users');
const { UnauthorizedAccessError, JwtTokenExpiredError, NoJwtTokenError, JwtTokenSignatureError } = require('../models/errors');
const logger = require('../helpers/logger');

const helper = {};

/**
 * Callback function on authentication success
 * @function strategyCallback
 * @private
 * @param  {Object}   jwtPayload - Extracted payload from JWT token
 * @param  {Callback} cb         - Callback function
 */
const strategyCallback = (jwtPayload, cb) => {
  logger.debug(`Passport JWT checking: trying to find user with payload: ${jwtPayload}`);
  User.findOne({ login: jwtPayload.login })
    .then((user) => {
      if (!user) {
        logger.debug(`Passport JWT checking: no user found for payload: ${jwtPayload}`);
        return cb(null, false);
      }
      return cb(null, user);
    })
    .catch( /* istanbul ignore next */ err => cb(err));
};

// Authentication passport strategy
const strategy = new Strategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: tokenSecretKey,
}, strategyCallback);

// Registers JWT strategy authentication
passport.use(strategy);

/**
 * Initializes passport middleware on request
 * @method initialize
 */
helper.initialize = () => passport.initialize();

/**
 * Authenticates User from authorization header and JWT
 * @method authenticate
 * @param  {external:Request}  req  - Request received
 * @param  {external:Response} res  - Response to send
 * @param  {nextMiddleware}    next - Callback to pass control to next middleware
 */
helper.authenticate = (req, res, next) => passport.authenticate('jwt', { session: false }, (err, user, info) => {
  logger.debug(`Passport authentication done: - err = '${err}' - info = '${info}' - user = '${user}'`);
  if (err) return next(err);
  if (info) {
    if (info instanceof TokenExpiredError) return next(new JwtTokenExpiredError());
    if (info instanceof JsonWebTokenError) return next(new JwtTokenSignatureError());
    if (info instanceof Error && info.message === 'No auth token') return next(new NoJwtTokenError());
    /* istanbul ignore next */
    return next(new UnauthorizedAccessError());
  }
  if (user === null || user === false) return next(new UnauthorizedAccessError('USER_NOT_FOUND', 'No user found for login in JWT Token'));
  req.user = user;
  return next();
})(req, res, next);

module.exports = helper;
