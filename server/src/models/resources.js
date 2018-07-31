/* eslint no-param-reassign: 0 */

/**
 * @fileoverview Resource class
 * @module models/resource
 * @requires {@link external:kind-of}
 * @requires {@link external:express}
 * @requires helpers/logger
 * @requires helpers/security
 * @requires models/errors
 */

const kindOf = require('kind-of');
const express = require('express');
const logger = require('../helpers/logger');
const { requiresLogin, requiresRole } = require('../helpers/security');
const { NotFoundResourceError } = require('./errors');

/**
 * Parses query parameter on resource endpoint to construct options of db request
 * @function parseQueryParameters
 * @private
 * @param {Object} query - Request query
 * @returns options object of db request
 */
function parseQueryParameters(query) {
  const options = { populate: false };
  if (query) {
    if (query.populate) {
      if (query.populate === 'true') options.populate = true;
      else if (/^[a-zA-Z,]+$/.test(query.populate)) options.populate = query.populate.split(',');
      else logger.error(`Resource: received request with invalid populate query parameter '${query.populate}'`);
    }
    if (query.sort) {
      if (/^[a-zA-Z,-]+$/.test(query.sort)) options.sort = query.sort.split(',');
      else logger.error(`Resource: received request with invalid sort query parameter '${query.sort}'`);
    }
    if (query.limit) {
      if (/^[0-9]+$/.test(query.limit)) options.limit = Number(query.limit);
      else logger.error(`Resource: received request with invalid limit query parameter '${query.limit}'`);
    }
    if (query.skip) {
      if (/^[0-9]+$/.test(query.skip)) options.skip = Number(query.skip);
      else logger.error(`Resource: received request with invalid skip query parameter '${query.skip}'`);
    }
  }
  return options;
}

/**
 * Removes given properties from element
 * @function filterProperties
 * @private
 * @param {Object}          element   - Elements to be filtered
 * @param {string|string[]} props     - Property or list of properties to remove
 * @returns the element filtered
 */
function filterProperties(element, props) {
  if (props) {
    const type = kindOf(props);
    if (type === 'string') delete element[props];
    else if (type === 'array') props.forEach(prop => delete element[prop]);
    else throw new TypeError(`filterProperties: Props argument type must be string or string[] but got '${type}'`);
  }
  return element;
}

/**
 * Removes given properties from all elements of the list
 * @function listFilterProperties
 * @private
 * @param {Object[]}        list  - List of elements to be filtered
 * @param {string|string[]} props - Property or list of properties to remove
 * @returns the list of elements filtered
 */
function listFilterProperties(l, props) {
  if (props && l && l.length > 0) l.forEach(element => filterProperties(element, props));
  return l;
}

/**
 * Creates a resource list endpoint function
 * @function list
 * @private
 * @param {Object} document - Resource document
 * @returns a function handling call of document find method
 */
function list(resource) {
  return (req, res, next) => {
    const options = parseQueryParameters(req.query);
    logger.debug(`Resource list: listing ${resource.name} documents with options '${JSON.stringify(options)}'`);
    resource.document.find({}, options)
      .then(l => res.status(200).json({ list: listFilterProperties(l, resource.config.filter) }))
      .catch(err => next(err));
  };
}

/**
 * Creates a resource get endpoint function
 * @function get
 * @private
 * @param {Object} resource - Resource
 * @returns a function handling call of document findOne method
 */
function get(resource) {
  return (req, res, next) => {
    const options = parseQueryParameters(req.query);
    // Only populate option is allowed
    delete options.sort;
    delete options.limit;
    delete options.skip;
    logger.debug(`Resource get: getting ${resource.name} document with id ${req.params.id} with options '${JSON.stringify(options)}'`);
    resource.document.findOne({ _id: req.params.id }, options)
      .then((element) => {
        if (!element) next(new NotFoundResourceError(req.params.id));
        else res.status(200).json(filterProperties(element, resource.config.filter));
      })
      .catch(err => next(err));
  };
}

/**
 * Creates a resource post endpoint function
 * @function post
 * @private
 * @param {Object} document - Resource document
 * @returns a function handling call of document creation method
 */
function post(resource) {
  return (req, res, next) => {
    logger.debug(`Resource post: creating ${resource.name} document with '${JSON.stringify(req.body)}'`);
    resource.document.create(req.body)
      .save()
      .then(element => res.status(201).json(filterProperties(element, resource.config.filter)))
      .catch(err => next(err));
  };
}

/**
 * Creates a resource put endpoint function
 * @function put
 * @private
 * @param {Object} resource - Resource
 * @returns a function handling call of document update method
 */
function put(resource) {
  return (req, res, next) => {
    logger.debug(`Resource put: updating ${resource.name} document with '${JSON.stringify(req.body)}'`);
    resource.document.findOneAndUpdate({ _id: req.params.id }, req.body)
      .then((ele) => {
        if (!ele) next(new NotFoundResourceError(req.params.id));
        else res.status(204).end();
      })
      .catch(err => next(err));
  };
}

/**
 * Creates a resource delete endpoint function
 * @function delete
 * @private
 * @param {Object} resource - Resource
 * @returns a function handling call of document delete method
 */
function deleteFn(resource) {
  return (req, res, next) => {
    logger.debug(`Resource delete: deleting ${resource.name} document with id '${req.params.id}'`);
    resource.document.deleteOne({ _id: req.params.id })
      .then((deleted) => {
        if (deleted === 0) next(new NotFoundResourceError(req.params.id));
        else res.status(204).end();
      })
      .catch(err => next(err));
  };
}

/**
 * Add a configured endpoint to the given router
 * @function addRoute
 * @private
 * @param {string} name       - Resource name
 * @param {Object} config     - Enpoint configuration
 * @param {string} method     - Endpoint http method
 * @param {Object} router     - Express router
 * @param {string} route      - Endpoint route
 * @param {function} callback - Endpoint function
 */
const addRoute = (name, config, method, router, route, callback) => {
  if (config) {
    if (config.protected === true) {
      if (config.roles) {
        if (kindOf(config.roles) === 'array') {
          router[method](route, requiresLogin, requiresRole(config.roles), callback);
        } else throw new TypeError(`Resource config route role must an string[] instead got '${kindOf(config.roles)}'`);
      } else router[method](route, requiresLogin, callback);
    }
  } else router[method](route, callback);
  logger.info(`Resource '${name}': '${method.toUpperCase()} ${route}' route ${(config && config.protected) ? 'protected' : ''} ${(config && config.roles) ? `with roles[${config.roles}]` : ''} created`);
};

/**
 * Creates a new Resource
 * @class
 * @name Resource
 * @param {string} name     - Resource name
 * @param {Object} document - Resource associated document
 * @param {Object} [config] - Resource configuration
 */
class Resource {
  constructor(name, document, config) {
    if (!name) throw new TypeError('No Resource name found');
    if (kindOf(name) !== 'string' || name === '') throw new TypeError('Resource name must be a non empty string');

    /**
     * Resource name
     * @member {string}
     */
    this.name = name;

    if (!document) throw new TypeError('No document associated to the new Resource');
    if (kindOf(document) !== 'function') throw new TypeError('Resource document must be a function');

    /**
     * Resource document
     * @member {function}
     */
    this.document = document;

    /**
     * Resource config
     * @member {Object}
     * @default {}
     */
    this.config = config || {};

    /**
     * Resource router
     * @member {Object}
     */
    this.router = express.Router();

    /** Add of resource routes */
    addRoute(this.name, this.config.global || this.config.list, 'get', this.router, '/', list(this));
    addRoute(this.name, this.config.global || this.config.get, 'get', this.router, '/:id', get(this));
    addRoute(this.name, this.config.global || this.config.post, 'post', this.router, '/', post(this));
    addRoute(this.name, this.config.global || this.config.put, 'put', this.router, '/:id', put(this));
    addRoute(this.name, this.config.global || this.config.delete, 'delete', this.router, '/:id', deleteFn(this));

    logger.info(`Resource '${this.name}': created`);
  }
}

module.exports = Resource;
