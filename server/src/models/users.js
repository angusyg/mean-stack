/**
 * @fileoverview User class module
 * @module models/users
 * @requires {@link external:mongoose}
 * @requires {@link external:bcrypt}
 * @requires {@link external:express-restify-mongoose}
 * @requires config/app
 * @requires config/api
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const restify = require('express-restify-mongoose');
const config = require('../config/app');
const apiCfg = require('../config/api');

const Schema = mongoose.Schema;

/**
 * Describes a user settings
 * @class
 * @name SettingsSchema
 */
const SettingsSchema = new Schema({
  /**
   * User theme
   * @member {string}
   */
  theme: {
    type: String,
  },
});

/**
 * Describes a User
 * @class
 * @name UserSchema
 */
const UserSchema = new Schema({
  /**
   * User login
   * @member {string}
   */
  login: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },

  /**
   * User password
   * @member {string}
   */
  password: {
    type: String,
    required: true,
  },

  /**
   * User roles
   * @member {string[]}
   */
  roles: {
    type: [String],
    required: true,
    default: ['USER'],
  },

  /**
   * User refresh token
   * @member {string}
   * @default ''
   */
  refreshToken: {
    type: String,
    default: '',
  },

  /**
   * User settings
   * @member {SettingsSchema}
   */
  settings: {
    type: SettingsSchema,
    default: { theme: 'theme-default' },
  },
});

/**
 * Pre save hook, encrypts user password before persist
 * @method preSave
 * @private
 */
UserSchema.pre('save', function(next) {
  if (this.isModified('password')) this.password = bcrypt.hashSync(this.password, config.app.saltFactor);
  next();
});

/**
 * Compares a candidate password with user password
 * @method comparePassword
 * @param  {string}           candidatePassword - Candidate password
 * @return {Promise<boolean>} true if candidate password match, false if not
 */
UserSchema.methods.comparePassword = function(candidatePassword) {
  new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, this.password)
      .then(match => resolve(match))
      .catch(err => reject(err));
  });
};

/**
 * Configures REST Users endpoint
 * @method restify
 * @static
 * @param  {external:Router} router - Express Router
 */
UserSchema.statics.restify = function(router, preMiddleware) {
  const options = Object.assign({}, apiCfg.restResourceOptions);
  // Endpoint path
  options.name = 'Users';
  // Filtered properties
  options.private.push('password', 'refreshToken');
  // Adds pre middleware if needed
  if (preMiddleware) options.preMiddleware = preMiddleware;
  restify.serve(router, this, options);
};

module.exports = mongoose.model('User', UserSchema);
