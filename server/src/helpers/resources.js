/**
 * @fileoverview Resource helper
 * @module helpers/resources
 * @requires models/resources
 */

const Resource = require('../models/resources');

const resources = new Map();
const helper = {};

helper.addResource = (name, document, config) => {
  const resource = new Resource(name, document, config);
  resources.set(name, resource);
  return resource;
};

helper.removeResource = name => resources.delete(name);

helper.getResource = name => resources.get(name);

helper.getResourceRouter = name => resources.get(name).router;

module.exports = helper;
