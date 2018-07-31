/* eslint global-require: 0 */

const chai = require('chai');
let logger = require('./logger');

const expect = chai.expect;

describe('Module helpers/logger', () => {
  it('should export logger Object', (done) => {
    expect(logger).to.be.an('Object');
    expect(logger).to.have.own.property('trace').to.be.a('function');
    expect(logger).to.have.own.property('debug').to.be.a('function');
    expect(logger).to.have.own.property('info').to.be.a('function');
    expect(logger).to.have.own.property('warn').to.be.a('function');
    expect(logger).to.have.own.property('error').to.be.a('function');
    expect(logger).to.have.own.property('fatal').to.be.a('function');
    done();
  });

  describe('Unit tests', () => {
    beforeEach((done) => {
      delete require.cache[require.resolve('./logger')];
      done();
    });

    it('NODE_ENV=test: should not have streams', (done) => {
      process.env.NODE_ENV = 'test';
      logger = require('./logger');
      expect(logger.stream).to.have.own.property('streams').to.have.lengthOf(0);
      done();
    });

    it('NODE_ENV=development: should have 3 streams', (done) => {
      process.env.NODE_ENV = 'development';
      logger = require('./logger');
      expect(logger.stream).to.have.own.property('streams').to.have.lengthOf(3);
      done();
    });

    it('NODE_ENV=production: should have 1 stream', (done) => {
      process.env.NODE_ENV = 'production';
      logger = require('./logger');
      expect(logger.stream).to.have.own.property('streams').to.have.lengthOf(1);
      done();
    });
  });
});
