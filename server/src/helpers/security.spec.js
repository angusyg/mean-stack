const chai = require('chai');
const sinon = require('sinon');
const security = require('./security');
const passport = require('./passport');
const { ForbiddenOperationError } = require('../models/errors');

const expect = chai.expect;

describe('Module helpers/security', () => {
  it('should export initialize function', (done) => {
    expect(security).to.have.own.property('initialize').to.be.a('function');
    done();
  });

  it('should export refreshToken function', (done) => {
    expect(security).to.have.own.property('requiresLogin').to.be.a('function');
    done();
  });

  it('should export requiresRole function', (done) => {
    expect(security).to.have.own.property('requiresRole').to.be.a('function');
    done();
  });

  describe('Unit tests', () => {
    const req = { user: { roles: ['USER'] } };
    const res = {};
    let next;
    let initializeStub;
    let authenticateStub;

    beforeEach(() => {
      initializeStub = sinon.stub(passport, 'initialize');
      authenticateStub = sinon.stub(passport, 'authenticate');
      next = sinon.spy();
    });

    afterEach(() => {
      initializeStub.restore();
      authenticateStub.restore();
    });

    it('initialize(): should initialize passport', (done) => {
      security.initialize();
      expect(initializeStub.calledOnce).to.be.true;
      done();
    });

    it('requiresLogin(req: Request, res: Response, next: function): should call passport authenticate', (done) => {
      security.requiresLogin(req, res, next);
      expect(authenticateStub.withArgs(req, res, next).calledOnce).to.be.true;
      done();
    });

    it('requiresRole(): should return a middleware function', (done) => {
      expect(security.requiresRole()).to.be.a('function');
      done();
    });

    it('requiresRole()(req: Request, res: Response, next: function): should return a middleware which should call next', (done) => {
      security.requiresRole()(res, res, next);
      expect(next.withArgs().calledOnce).to.be.true;
      done();
    });

    it('requiresRole([])(req: Request, res: Response, next: function): should return a middleware which should call next', (done) => {
      security.requiresRole([])(req, res, next);
      expect(next.withArgs().calledOnce).to.be.true;
      done();
    });

    it('requiresRole(roles: [string])(req: Request, res: Response, next: function): should return a middleware which should call next because req user has appropriate role', (done) => {
      security.requiresRole(['USER'])(req, res, next);
      expect(next.withArgs().calledOnce).to.be.true;
      done();
    });

    it('requiresRole(roles: [string])(req: Request, res: Response, next: function): should return a middleware which should call next with error because req user has no appropriate role', (done) => {
      security.requiresRole(['ADMIN'])(req, res, next);
      expect(next.calledOnce).to.be.true;
      expect(next.getCall(0).args[0]).to.be.instanceof(ForbiddenOperationError);
      done();
    });
  });
});
