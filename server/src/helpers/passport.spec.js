/* eslint no-unused-expressions: 0 */

const chai = require('chai');
const sinon = require('sinon');
const psp = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/api');
const User = require('../models/users');
const { UnauthorizedAccessError, JwtTokenExpiredError, NoJwtTokenError, JwtTokenSignatureError } = require('../models/errors');
const passport = require('./passport');

const expect = chai.expect;

describe('Module helpers/passport', () => {
  it('should export initialize function', (done) => {
    expect(passport).to.have.property('initialize').to.be.a('function');
    done();
  });

  it('should export authenticate function', (done) => {
    expect(passport).to.have.property('authenticate').to.be.a('function');
    done();
  });

  describe('Unit tests', () => {
    const userTest = {
      login: 'TEST',
      password: 'TEST',
    };
    const unknownUser = {
      login: 'unknown',
      password: 'TEST',
    };
    const accessToken = jwt.sign(userTest, config.tokenSecretKey, { expiresIn: config.accessTokenExpirationTime });
    const accessTokenExpired = jwt.sign(userTest, config.tokenSecretKey, { expiresIn: 0 });
    const accessTokenBadSignature = jwt.sign(userTest, 'SECRET', { expiresIn: config.accessTokenExpirationTime });
    const accessTokenUserNotFound = jwt.sign(unknownUser, config.tokenSecretKey, { expiresIn: config.accessTokenExpirationTime });
    const req = { headers: { authorization: '' } };
    const res = {};
    const next = sinon.stub();
    const initializeStub = sinon.stub(psp, 'initialize');
    const findOneStub = sinon.stub(User, 'findOne');

    afterEach((done) => {
      initializeStub.reset();
      next.reset();
      findOneStub.reset();
      done();
    });

    after((done) => {
      initializeStub.restore();
      findOneStub.restore();
      done();
    });

    it('initialize(): should initialize passport', (done) => {
      passport.initialize();
      expect(initializeStub.withArgs().calledOnce).to.be.true;
      done();
    });

    it('authenticate(req: Request, res: Response, next: function): should call passport authenticate and put user in request', (done) => {
      req.headers.authorization = `bearer ${accessToken}`;
      findOneStub.withArgs({ login: userTest.login }).resolves(new User(userTest));

      passport.authenticate(req, res, next);
      setTimeout(() => {
        expect(req).to.have.property('user').to.deep.include(userTest);
        expect(next.withArgs().calledOnce).to.be.true;
        done();
      }, 1);
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
      findOneStub.withArgs({ login: unknownUser.login }).resolves(null);

      passport.authenticate(req, res, next);
      setTimeout(() => {
        expect(next.calledOnce).to.be.true;
        expect(next.getCall(0).args[0]).to.be.instanceof(UnauthorizedAccessError);
        expect(next.getCall(0).args[0]).to.have.property('code', 'USER_NOT_FOUND');
        expect(next.getCall(0).args[0]).to.have.property('message', 'No user found for login in JWT Token');
        done();
      }, 1);
    });
  });
});
