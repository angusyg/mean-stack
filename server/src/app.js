/**
 * @fileoverview Express application
 * @module app
 * @requires {@link external:express}
 * @requires {@link external:path}
 * @requires {@link external:body-parser}
 * @requires {@link external:compression}
 * @requires {@link external:express-pino-logger}
 * @requires {@link external:uuid/v4}
 * @requires {@link external:helmet}
 * @requires {@link external:cors}
 * @requires helpers/passport
 * @requires config/app
 * @requires config/api
 * @requires config/db
 * @requires helpers/errorhandler
 * @requires helpers/logger
 * @requires helpers/security
 * @requires helpers/resources
 * @requires routes/api
 */

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const compression = require('compression');
const pino = require('express-pino-logger');
const uuidv4 = require('uuid/v4');
const helmet = require('helmet');
const cors = require('cors');
const appCfg = require('./config/app');
const apiCfg = require('./config/api');
const { connect } = require('./config/db');
const errorHandler = require('./helpers/errorhandler');
const logger = require('./helpers/logger');
const security = require('./helpers/security');
const apiRouter = require('./routes/api');

const app = express();

app.set('port', appCfg.app.port);

// Logger middleware
app.use(pino({
  logger,
  genReqId: () => uuidv4(),
}));

// Connection to db
connect()
  .then(db => app.set('db', db))
  .catch(() => process.exit(-1));

// Security middlewares
app.use(helmet());
app.use(cors(appCfg.crossOrigin));

// Body parser (to json) middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Security initialization
app.use(security.initialize());

// Static files
app.use(compression());
app.use(express.static(path.join(__dirname, '../../client/dist')));

// Map modules routes
app.use(apiCfg.base, apiRouter);

// Default error handlers
app.use(errorHandler.errorNoRouteMapped);
app.use(errorHandler.errorHandler);

module.exports = app;
