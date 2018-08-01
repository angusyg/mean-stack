/* eslint no-unused-expressions: 0 */

const chai = require('chai');
const sinon = require('sinon');
const { ApiError, NotFoundError } = require('../models/errors');
const errorhandler = require('./errorhandler');

const expect = chai.expect;

describe('Module helpers/errorhandler', () => {
  it('should export errorNoRouteMapped function', (done) => {
    expect(errorhandler).to.have.own.property('errorNoRouteMapped').to.be.a('function');
    done();
  });

  it('should export errorHandler function', (done) => {
    expect(errorhandler).to.have.own.property('errorHandler').to.be.a('function');
    done();
  });

  describe('Unit tests', () => {
    const req = {};
    const res = {};
    const handleStub = sinon.stub(ApiError, 'handle');
    const next = sinon.stub();

    afterEach((done) => {
      handleStub.reset();
      next.reset();
      done();
    });

    it('errorNoRouteMapped(req: Request, res: Response, next: function): should call next with NotFoundError', (done) => {
      errorhandler.errorNoRouteMapped(req, res, next);
      expect(next.calledOnce).to.be.true;
      expect(next.getCall(0).args[0]).to.be.instanceof(NotFoundError);
      done();
    });

    it('errorHandler(err: Error, req: Request, res: Response, next: function): should handle error with ApiError.handle', (done) => {
      const error = new Error();
      errorhandler.errorHandler(error, req, res, next);
      expect(handleStub.withArgs(res, res, error).calledOnce).to.be.true;
      done();
    });

    it('errorHandler(err: Error, req: Request, res: Response, next: function): should call next with err if res had been sent', (done) => {
      const error = new Error();
      res.headersSent = true;
      errorhandler.errorHandler(error, req, res, next);
      expect(next.calledOnce).to.be.true;
      expect(next.getCall(0).args[0]).to.be.equal(error);
      done();
    });
  });
});
