/**
 * @fileoverview Application API controller
 * @module controllers/api
 * @requires config/api
 * @requires helpers/logger
 * @requires services/api
 */

const { refreshTokenHeader } = require('../config/api');
const logger = require('../helpers/logger');
const apiService = require('../services/api');
const { ApiError } = require('../models/errors');

const controller = {};

/**
 * Logger endpoint handler
 * @method logger
 * @param  {external:Request}  req - Request received
 * @param  {external:Response} res - Response to send
 * @param  {nextMiddleware}    next  - Callback to pass control to next middleware
 */
controller.logger = (req, res, next) => {
  if (!logger[req.params.level]) next(new ApiError(`${req.params.level} is not a valid log level`));
  else {
    logger[req.params.level](JSON.stringify(req.body));
    res.status(204).end();
  }
};

/**
 * Login endpoint handler
 * @method login
 * @param  {external:Request}   req   - Request received
 * @param  {external:Response}  res   - Response to send
 * @param  {nextMiddleware}     next  - Callback to pass control to next middleware
 */
controller.login = (req, res, next) => {
  apiService.login(req.body)
    .then(tokens => res.status(200).json(tokens))
    .catch(err => next(err));
};

/**
 * Logout endpoint handler
 * @method logout
 * @param  {external:Request}  req - Request received
 * @param  {external:Response} res - Response to send
 */
controller.logout = (req, res) => res.status(204).end();

/**
 * Refresh token endpoint handler
 * @method refreshToken
 * @param  {external:Request}  req - Request received
 * @param  {external:Response} res - Response to send
 * @param  {nextMiddleware}    next  - Callback to pass control to next middleware
 */
controller.refreshToken = (req, res, next) => {
  apiService.refreshToken(req.user, req.headers[refreshTokenHeader])
    .then(token => res.status(200).json(token))
    .catch(err => next(err));
};

/**
 * JWT Token validation endpoint handler
 * @method validateToken
 * @param  {external:Request}  req - Request received
 * @param  {external:Response} res - Response to send
 */
controller.validateToken = (req, res) => res.status(204).end();

module.exports = controller;
