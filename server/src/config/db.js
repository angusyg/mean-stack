/**
 * @fileoverview This is Mongoose configuration values
 * @module config/db
 * @requires {@link external:mongoose}
 * @requires helpers/logger
 */

const mongoose = require('mongoose');
const logger = require('../helpers/logger');

const server = process.env.DB_URL || '127.0.0.1';
const database = process.env.DB_NAME || 'mean';

/**
 * Connect app to MongoDB database
 * @function connect
 */
const connect = () => new Promise((resolve, reject) => {
  mongoose.connect(`mongodb://${server}/${database}`)
    .then(() => {
      logger.info(`Connection opened to DB 'mongodb://${server}/${database}'`);
      resolve(mongoose.connection);
    })
    .catch((err) => {
      logger.fatal(`Error during DB connection : ${JSON.stringify(err)}`);
      reject(err);
    });
});

module.exports = { connect };
