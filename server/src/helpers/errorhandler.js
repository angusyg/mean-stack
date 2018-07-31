/**
 * @fileoverview Middlewares for error handling
 * @module helpers/errorhandler
 * @requires models/errors
 */

const { ApiError, NotFoundError } = require('../models/errors');

const errorhandler = {};
/**
 * Catch all non mapped request for error
 * @method errorNoRouteMapped
 * @param  {external:Error}     req  - Request received
 * @param  {external:Response}  res  - Response to be send
 * @param  {nextMiddleware}     next - Callback to pass control to next middleware
 */
errorhandler.errorNoRouteMapped = (req, res, next) => next(new NotFoundError());

/**
 * Default Error handler
 * @method errorHandler
 * @param  {external:Error}     err  - Unhandled error to process
 * @param  {external:Request}   req  - Request received
 * @param  {external:Response}  res  - Response to be send
 * @param  {nextMiddleware}     next - Callback to pass control to next middleware
 */
errorhandler.errorHandler = (err, req, res, next) => {
  if (res.headersSent) next(err);
  else ApiError.handle(req, res, err);
};

module.exports = errorhandler;
