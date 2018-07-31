/**
 * @fileoverview User class module
 * @module models/users
 * @requires {@link external:mongoose}
 * @requires {@link external:bcrypt}
 * @requires config/app
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const config = require('../config/app');

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
UserSchema.pre('save', (next) => {
  if (this.isModified('password')) this.password = bcrypt.hashSync(this.password, config.app.saltFactor);
  next();
});

/**
 * Compares a candidate password with user password
 * @method comparePassword
 * @param  {string}           candidatePassword - Candidate password
 * @return {Promise<boolean>} true if candidate password match, false if not
 */
UserSchema.methods.comparePassword = candidatePassword => new Promise((resolve) => {
  bcrypt.compare(candidatePassword, this.password)
    .then(match => resolve(match));
});

module.exports = {
  UserSchema,
  User: mongoose.model('User', UserSchema),
};
