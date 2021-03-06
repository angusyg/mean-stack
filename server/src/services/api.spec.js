const chai = require('chai');
const sinon = require('sinon');
const util = require('util');
const proxyquire = require('proxyquire');
const jsonwebtoken = require('jsonwebtoken');
const User = require('../models/users');
const config = require('../config/api');
const { ApiError, UnauthorizedAccessError } = require('../models/errors');

const jwtVerify = util.promisify(jsonwebtoken.verify);
const expect = chai.expect;

describe('Module services/api', () => {
  const refreshToken = '00000000-0000-0000-0000-000000000000';
  const uuidV4Stub = () => refreshToken;
  let api;

  before((done) => {
    api = proxyquire('./api', { 'uuid/v4': uuidV4Stub });
    done();
  });

  it('should export login function', (done) => {
    expect(api).to.have.property('login').to.be.a('function');
    done();
  });

  it('should export refreshToken function', (done) => {
    expect(api).to.have.property('refreshToken').to.be.a('function');
    done();
  });

  describe('Unit tests', () => {
    const userTest = {
      login: 'TEST',
      password: 'TEST',
    };
    const userTestBadLogin = {
      login: 'BADLOGIN',
      password: 'PASSWORD',
    };
    let saveStub;
    let findOneStub;
    let findOneAndUpdateStub;
    let comparePasswordStub;

    beforeEach((done) => {
      saveStub = sinon.stub(User.prototype, 'save');
      findOneStub = sinon.stub(User, 'findOne');
      findOneAndUpdateStub = sinon.stub(User, 'findOneAndUpdate');
      comparePasswordStub = sinon.stub(User.prototype, 'comparePassword');
      done();
    });

    afterEach((done) => {
      saveStub.restore();
      findOneStub.restore();
      findOneAndUpdateStub.restore();
      comparePasswordStub.restore();
      done();
    });

    it('login(infos: Object): should connect user with infos and update refreshToken in database', (done) => {
      const user = new User(userTest);
      findOneStub.withArgs({ login: userTest.login }).resolves(user);
      comparePasswordStub.withArgs(userTest.password).resolves(true);
      findOneAndUpdateStub.withArgs({ _id: user._id }, { refreshToken: uuidV4Stub() }).resolves(Object.assign(user, { refreshToken: uuidV4Stub() }));
      saveStub.withArgs().resolves();

      api.login(userTest)
        .then((tokens) => {
          expect(tokens).to.be.an('object');
          expect(tokens).to.have.property('refreshToken', user.refreshToken);
          expect(tokens).to.have.property('accessToken');
          jwtVerify(tokens.accessToken, config.tokenSecretKey)
            .then(() => done())
            .catch(err => done(err));
        })
        .catch(err => done(err));
    });

    it('login(infos: Object): should reject with a Bad login UnauthorizedAccessError', (done) => {
      findOneStub.withArgs({ login: userTestBadLogin.login }).resolves(null);

      api.login(userTestBadLogin)
        .catch((err) => {
          expect(err).to.be.an.instanceof(Error);
          expect(err).to.be.an.instanceof(ApiError);
          expect(err).to.be.an.instanceof(UnauthorizedAccessError);
          expect(err).to.have.property('name', 'UnauthorizedAccessError');
          expect(err).to.have.property('statusCode', 401);
          expect(err).to.have.property('code', 'BAD_LOGIN');
          expect(err).to.have.property('message', 'Bad login');
          done();
        });
    });

    it('login(infos: Object): should reject with a Bad password UnauthorizedAccessError', (done) => {
      const user = new User(userTest);
      findOneStub.withArgs({ login: userTest.login }).resolves(user);
      comparePasswordStub.withArgs(userTest.password).resolves(false);

      api.login(userTest)
        .catch((err) => {
          expect(err).to.be.an.instanceof(Error);
          expect(err).to.be.an.instanceof(ApiError);
          expect(err).to.be.an.instanceof(UnauthorizedAccessError);
          expect(err).to.have.property('name', 'UnauthorizedAccessError');
          expect(err).to.have.property('statusCode', 401);
          expect(err).to.have.property('code', 'BAD_PASSWORD');
          expect(err).to.have.property('message', 'Bad password');
          done();
        });
    });

    it('login(infos: Object): should reject on findOne error', (done) => {
      findOneStub.withArgs({ login: userTest.login }).rejects(new Error('Internal error'));

      api.login(userTest)
        .catch((err) => {
          expect(err).to.be.an.instanceof(Error);
          expect(err).to.have.property('message', 'Internal error');
          done();
        });
    });

    it('login(infos: Object): should reject on comparePassword error', (done) => {
      const user = new User(userTest);
      findOneStub.withArgs({ login: userTest.login }).resolves(user);
      comparePasswordStub.withArgs(userTest.password).rejects(new Error('Internal error'));

      api.login(userTest)
        .catch((err) => {
          expect(err).to.be.an.instanceof(Error);
          expect(err).to.have.property('message', 'Internal error');
          done();
        });
    });

    it('refreshToken(user: Object, refreshToken: string): should returns a new access Jwt token', (done) => {
      const user = new User(Object.assign({ refreshToken: uuidV4Stub() }, userTest));
      findOneStub.withArgs({ login: userTest.login }).resolves(user);

      api.refreshToken(userTest, refreshToken)
        .then((token) => {
          expect(token).to.be.an('object');
          expect(token).to.have.property('accessToken');
          jwtVerify(token.accessToken, config.tokenSecretKey)
            .then((u) => {
              expect(u).to.have.property('id', user.id);
              expect(u).to.have.property('login', user.login);
              expect(u).to.have.property('roles').to.be.an('array').to.have.lengthOf(1).to.include('USER');
              done();
            })
            .catch(err => done(err));
        })
        .catch(err => done(err));
    });

    it('refreshToken(user: Object, refreshToken: string): should reject with an UnauthorizedAccessError for missing refresh token', (done) => {
      api.refreshToken(userTest)
        .catch((err) => {
          expect(err).to.be.an.instanceof(Error);
          expect(err).to.be.an.instanceof(ApiError);
          expect(err).to.be.an.instanceof(UnauthorizedAccessError);
          expect(err).to.have.property('name', 'UnauthorizedAccessError');
          expect(err).to.have.property('statusCode', 401);
          expect(err).to.have.property('code', 'MISSING_REFRESH_TOKEN');
          expect(err).to.have.property('message', 'Refresh token\'s missing');
          done();
        });
    });

    it('refreshToken(user: Object, refreshToken: string): should reject with an UnauthorizedAccessError for revoked/bad refresh token', (done) => {
      const user = new User(userTest);
      findOneStub.withArgs({ login: userTest.login }).resolves(user);

      api.refreshToken(userTest, refreshToken)
        .catch((err) => {
          expect(err).to.be.an.instanceof(Error);
          expect(err).to.be.an.instanceof(ApiError);
          expect(err).to.be.an.instanceof(UnauthorizedAccessError);
          expect(err).to.have.property('name', 'UnauthorizedAccessError');
          expect(err).to.have.property('statusCode', 401);
          expect(err).to.have.property('code', 'REFRESH_NOT_ALLOWED');
          expect(err).to.have.property('message', 'Refresh token has been revoked');
          done();
        });
    });

    it('refreshToken(user: Object, refreshToken: string): should reject with an ApiError for user not being found', (done) => {
      findOneStub.withArgs({ login: userTest.login }).resolves(null);

      api.refreshToken(userTest, refreshToken)
        .catch((err) => {
          expect(err).to.be.an.instanceof(Error);
          expect(err).to.be.an.instanceof(ApiError);
          expect(err).to.have.property('name', 'ApiError');
          expect(err).to.have.property('statusCode', 500);
          expect(err).to.have.property('code', 'USER_NOT_FOUND');
          expect(err).to.have.property('message', 'No user found for login in JWT Token');
          done();
        });
    });

    it('refreshToken(user: Object, refreshToken: string): should reject on findOne error', (done) => {
      findOneStub.withArgs({ login: userTest.login }).rejects(new Error('Internal error'));

      api.login(userTest)
        .catch((err) => {
          expect(err).to.be.an.instanceof(Error);
          expect(err).to.have.property('message', 'Internal error');
          done();
        });
    });
  });
});
