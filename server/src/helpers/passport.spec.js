/* eslint no-unused-expressions: 0 */

const chai = require('chai');
const sinon = require('sinon');
const psp = require('passport');
const proxyquire = require('proxyquire');
const jwt = require('jsonwebtoken');
const config = require('../config/api');
const User = require('../models/users');
const { UnauthorizedAccessError, JwtTokenExpiredError, NoJwtTokenError, JwtTokenSignatureError } = require('../models/errors');

const expect = chai.expect;

describe('Module helpers/passport', () => {
  const UserMock = sinon.mock(User);
  const userTest = {
    login: 'test',
    roles: ['USER'],
  };
  const unknownUser = {
    login: 'unknown',
    roles: ['USER'],
  };
  let passport;

  before((done) => {
    UserMock.expects('findOne').withArgs({ login: userTest.login }).resolves(userTest);
    UserMock.expects('findOne').withArgs({ login: unknownUser.login }).resolves(null);
    passport = proxyquire('./passport', { '../models/users': UserMock });
    done();
  });

  after((done) => {
    UserMock.restore();
    done();
  });

  it('should export initialize function', (done) => {
    expect(passport).to.have.own.property('initialize').to.be.a('function');
    done();
  });

  it('should export authenticate function', (done) => {
    expect(passport).to.have.own.property('authenticate').to.be.a('function');
    done();
  });

  describe('Unit tests', () => {
    const accessToken = jwt.sign(userTest, config.tokenSecretKey, { expiresIn: config.accessTokenExpirationTime });
    const accessTokenExpired = jwt.sign(userTest, config.tokenSecretKey, { expiresIn: 0 });
    const accessTokenBadSignature = jwt.sign(userTest, 'SECRET', { expiresIn: config.accessTokenExpirationTime });
    const accessTokenUserNotFound = jwt.sign(unknownUser, config.tokenSecretKey, { expiresIn: config.accessTokenExpirationTime });
    const req = { headers: { authorization: '' } };
    const res = {};
    const next = sinon.stub();
    const initializeStub = sinon.stub(psp, 'initialize');

    afterEach((done) => {
      initializeStub.reset();
      next.reset();
      done();
    });

    after((done) => {
      initializeStub.restore();
      done();
    });

    it('initialize(): should initialize passport', (done) => {
      passport.initialize();
      expect(initializeStub.withArgs().calledOnce).to.be.true;
      done();
    });

    it('authenticate(req: Request, res: Response, next: function): should call passport authenticate and put user in request', (done) => {
      req.headers.authorization = `bearer ${accessToken}`;
      passport.authenticate(req, res, next);
      setTimeout(() => {
        expect(req).to.have.own.property('user').to.deep.include(userTest);
        expect(next.withArgs().calledOnce).to.be.true;
        done();
      }, 100);
    });

    it('authenticate(req: Request, res: Response, next: function): should call passport authenticate and call next with JwtTokenExpiredError', (done) => {
      req.headers.authorization = `bearer ${accessTokenExpired}`;
      passport.authenticate(req, res, next);
      expect(next.calledOnce).to.be.true;
      expect(next.getCall(0).args[0]).to.be.instanceof(JwtTokenExpiredError);
      done();
    });

    it('authenticate(req: Request, res: Response, next: function): should call passport authenticate and call next with JwtTokenSignatureError', (done) => {
      req.headers.authorization = `bearer ${accessTokenBadSignature}`;
      passport.authenticate(req, res, next);
      expect(next.calledOnce).to.be.true;
      expect(next.getCall(0).args[0]).to.be.instanceof(JwtTokenSignatureError);
      done();
    });

    it('authenticate(req: Request, res: Response, next: function): should call passport authenticate and call next with NoJwtTokenError', (done) => {
      req.headers.authorization = 'bearer ';
      passport.authenticate(req, res, next);
      expect(next.calledOnce).to.be.true;
      expect(next.getCall(0).args[0]).to.be.instanceof(NoJwtTokenError);
      done();
    });

    it('authenticate(req: Request, res: Response, next: function): should call passport authenticate and call next with UnauthorizedAccessError because user does not exist', (done) => {
      req.headers.authorization = `bearer ${accessTokenUserNotFound}`;
      passport.authenticate(req, res, next);
      setTimeout(() => {
        expect(next.calledOnce).to.be.true;
        expect(next.getCall(0).args[0]).to.be.instanceof(UnauthorizedAccessError);
        expect(next.getCall(0).args[0]).to.have.own.property('code', 'USER_NOT_FOUND');
        expect(next.getCall(0).args[0]).to.have.own.property('message', 'No user found for login in JWT Token');
        done();
      }, 100);
    });
  });
});
