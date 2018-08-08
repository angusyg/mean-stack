/* eslint import/no-extraneous-dependencies: 0 */

const chai = require('chai');
const chaiHttp = require('chai-http');
const request = require('supertest');
const uuidv4 = require('uuid/v4');
const jsonwebtoken = require('jsonwebtoken');
const util = require('util');
const User = require('../../src/models/users');

chai.use(chaiHttp);
const expect = chai.expect;
const uuid = /^[A-F\d]{8}-[A-F\d]{4}-4[A-F\d]{3}-[89AB][A-F\d]{3}-[A-F\d]{12}$/i;
const jwtVerify = util.promisify(jsonwebtoken.verify);

module.exports = (app, config) => {
  describe('Base endpoints integration tests', () => {
    describe('GET /urlnotfound', () => {
      it('ERROR: should return a 404 error', (done) => {
        request(app)
          .get('/notfound')
          .end((err, res) => {
            expect(res.statusCode).to.equal(404);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('code', 'NOT_FOUND');
            expect(res.body).to.have.property('message', 'Not Found');
            expect(res.body).to.have.property('reqId');
            expect(res.body.reqId).to.match(uuid);
            done();
          });
      });
    });

    describe('POST /api/login', () => {
      const userTest = {
        login: 'TEST',
        password: 'TEST',
        roles: ['USER'],
      };

      before((done) => {
        User.create(userTest)
          .then(() => done())
          .catch(err => done(err));
      });

      after((done) => {
        User.remove({})
          .then(() => done())
          .catch(err => done(err));
      });

      it('OK: should return authentication tokens', (done) => {
        request(app)
          .post('/api/login')
          .send({
            login: userTest.login,
            password: userTest.password,
          })
          .end(async (err, res) => {
            expect(res.statusCode).to.equal(200);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('refreshToken');
            expect(res.body.refreshToken).to.match(uuid);
            expect(res.body).to.have.property('accessToken');
            try {
              const payload = await jwtVerify(res.body.accessToken, config.tokenSecretKey);
              expect(payload).to.have.property('login', userTest.login);
              expect(payload).to.have.property('roles').to.be.an('array').to.have.lengthOf(1).to.include(userTest.roles[0]);
              done();
            } catch (error) {
              done(error);
            }
          });
      });

      it('ERROR: should return a bad login error', (done) => {
        request(app)
          .post('/api/login')
          .send({
            login: 'BADLOGIN',
            password: userTest.password,
          })
          .end((err, res) => {
            expect(res.statusCode).to.equal(401);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('code', 'BAD_LOGIN');
            expect(res.body).to.have.property('message', 'Bad login');
            expect(res.body).to.have.property('reqId');
            expect(res.body.reqId).to.match(uuid);
            done();
          });
      });

      it('ERROR: should return a bad password error', (done) => {
        request(app)
          .post('/api/login')
          .send({
            login: userTest.login,
            password: 'BADPASSWORD',
          })
          .end((err, res) => {
            expect(res.statusCode).to.equal(401);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('code', 'BAD_PASSWORD');
            expect(res.body).to.have.property('message', 'Bad password');
            expect(res.body).to.have.property('reqId');
            expect(res.body.reqId).to.match(uuid);
            done();
          });
      });
    });

    describe('GET /api/refresh', () => {
      const refreshToken = uuidv4();
      const userTest = {
        login: 'TEST',
        password: 'PASSWORD',
        roles: ['USER'],
        refreshToken,
      };
      const userTestBadRefresh = {
        login: 'BADREFRESH',
        password: 'PASSWORD',
        roles: ['USER'],
        refreshToken: 'BADREFRESH',
      };
      const userTestBadLogin = {
        login: 'BADLOGIN',
        password: 'PASSWORD',
        roles: ['USER'],
        refreshToken,
      };
      const accessToken = jsonwebtoken.sign(userTest, config.tokenSecretKey, { expiresIn: config.accessTokenExpirationTime });
      const accessTokenBadRefresh = jsonwebtoken.sign(userTestBadRefresh, config.tokenSecretKey, { expiresIn: config.accessTokenExpirationTime });
      const accessTokenBadLogin = jsonwebtoken.sign(userTestBadLogin, config.tokenSecretKey, { expiresIn: config.accessTokenExpirationTime });

      before((done) => {
        Promise.all([
            User.create(userTest),
            User.create(userTestBadRefresh),
          ])
          .then(() => done())
          .catch(err => done(err));
      });

      after((done) => {
        User.remove({})
          .then(() => done())
          .catch(err => done(err));
      });

      it('OK: should return an access token', (done) => {
        request(app)
          .get('/api/refresh')
          .set(config.accessTokenHeader, `bearer ${accessToken}`)
          .set(config.refreshTokenHeader, refreshToken)
          .end(async (err, res) => {
            expect(res.statusCode).to.equal(200);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('accessToken');
            try {
              const payload = await jwtVerify(res.body.accessToken, config.tokenSecretKey);
              expect(payload).to.have.property('login', userTest.login);
              expect(payload).to.have.property('roles').to.be.an('array').to.have.lengthOf(1).to.include(userTest.roles[0]);
              done();
            } catch (error) {
              done(error);
            }
          });
      });

      it('ERROR: should return an unauthorized error', (done) => {
        request(app)
          .get('/api/refresh')
          .set(config.accessTokenHeader, `bearer ${accessTokenBadRefresh}`)
          .set(config.refreshTokenHeader, refreshToken)
          .end((err, res) => {
            expect(res.statusCode).to.equal(401);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('code', 'REFRESH_NOT_ALLOWED');
            expect(res.body).to.have.property('message', 'Refresh token has been revoked');
            expect(res.body).to.have.property('reqId');
            expect(res.body.reqId).to.match(uuid);
            done();
          });
      });

      it('ERROR: should return an user not found error', (done) => {
        request(app)
          .get('/api/refresh')
          .set(config.accessTokenHeader, `bearer ${accessTokenBadLogin}`)
          .set(config.refreshTokenHeader, refreshToken)
          .end((err, res) => {
            expect(res.statusCode).to.equal(401);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('code', 'USER_NOT_FOUND');
            expect(res.body).to.have.property('message', 'No user found for login in JWT Token');
            expect(res.body).to.have.property('reqId');
            expect(res.body.reqId).to.match(uuid);
            done();
          });
      });

      it('ERROR: should return a missing refresh token error', (done) => {
        request(app)
          .get('/api/refresh')
          .set(config.accessTokenHeader, `bearer ${accessToken}`)
          .end((err, res) => {
            expect(res.statusCode).to.equal(401);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('code', 'MISSING_REFRESH_TOKEN');
            expect(res.body).to.have.property('message', 'Refresh token\'s missing');
            expect(res.body).to.have.property('reqId');
            expect(res.body.reqId).to.match(uuid);
            done();
          });
      });
    });

    describe('GET /api/logout', () => {
      const refreshToken = uuidv4();
      const userTest = {
        login: 'TEST',
        password: 'PASSWORD',
        roles: ['USER'],
        refreshToken,
      };
      const userTestBadRefresh = {
        login: 'BADREFRESH',
        password: 'PASSWORD',
        roles: ['USER'],
        refreshToken: 'BADREFRESH',
      };
      const userTestBadLogin = {
        login: 'BADLOGIN',
        password: 'PASSWORD',
        roles: ['USER'],
        refreshToken,
      };
      const accessToken = jsonwebtoken.sign(userTest, config.tokenSecretKey, { expiresIn: config.accessTokenExpirationTime });
      const accessTokenBadSignature = jsonwebtoken.sign(userTestBadRefresh, ' ', { expiresIn: config.accessTokenExpirationTime });
      const accessTokenExpired = jsonwebtoken.sign(userTestBadLogin, config.tokenSecretKey, { expiresIn: 0 });

      before((done) => {
        User.create(userTest)
          .then(() => done())
          .catch(err => done(err));
      });

      after((done) => {
        User.remove({})
          .then(() => done())
          .catch(err => done(err));
      });

      it('OK: should return no content', (done) => {
        request(app)
          .get('/api/logout')
          .set(config.accessTokenHeader, `bearer ${accessToken}`)
          .end((err, res) => {
            expect(res.statusCode).to.equal(204);
            expect(res.body).to.be.an('object');
            expect(res.body).to.be.empty;
            done();
          });
      });

      it('ERROR: should return a no token error', (done) => {
        request(app)
          .get('/api/logout')
          .end((err, res) => {
            expect(res.statusCode).to.equal(401);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('code', 'NO_TOKEN_FOUND');
            expect(res.body).to.have.property('message', 'No Jwt token found in authorization header');
            expect(res.body).to.have.property('reqId');
            done();
          });
      });

      it('ERROR: should return an invalid token signature error', (done) => {
        request(app)
          .get('/api/logout')
          .set(config.accessTokenHeader, `bearer ${accessTokenBadSignature}`)
          .end((err, res) => {
            expect(res.statusCode).to.equal(401);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('code', 'INVALID_TOKEN_SIGNATURE');
            expect(res.body).to.have.property('message', 'Jwt token signature is invalid');
            expect(res.body).to.have.property('reqId');
            done();
          });
      });

      it('ERROR: should return an expired token error', (done) => {
        request(app)
          .get('/api/logout')
          .set(config.accessTokenHeader, `bearer ${accessTokenExpired}`)
          .end((err, res) => {
            expect(res.statusCode).to.equal(401);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('code', 'TOKEN_EXPIRED');
            expect(res.body).to.have.property('message', 'Jwt token has expired');
            expect(res.body).to.have.property('reqId');
            done();
          });
      });
    });

    describe('GET /api/validate', () => {
      const refreshToken = uuidv4();
      const userTest = {
        login: 'TEST',
        password: 'PASSWORD',
        roles: ['USER'],
        refreshToken,
      };
      const userTestBadRefresh = {
        login: 'BADREFRESH',
        password: 'PASSWORD',
        roles: ['USER'],
        refreshToken: 'BADREFRESH',
      };
      const userTestBadLogin = {
        login: 'BADLOGIN',
        password: 'PASSWORD',
        roles: ['USER'],
        refreshToken,
      };
      const accessToken = jsonwebtoken.sign(userTest, config.tokenSecretKey, { expiresIn: config.accessTokenExpirationTime });
      const accessTokenBadSignature = jsonwebtoken.sign(userTestBadRefresh, ' ', { expiresIn: config.accessTokenExpirationTime });
      const accessTokenExpired = jsonwebtoken.sign(userTestBadLogin, config.tokenSecretKey, { expiresIn: 0 });

      before((done) => {
        User.create(userTest)
          .then(() => done())
          .catch(err => done(err));
      });

      after((done) => {
        User.remove({})
          .then(() => done())
          .catch(err => done(err));
      });

      it('OK: should return no content', (done) => {
        request(app)
          .get('/api/validate')
          .set(config.accessTokenHeader, `bearer ${accessToken}`)
          .end((err, res) => {
            expect(res.statusCode).to.equal(204);
            expect(res.body).to.be.an('object');
            expect(res.body).to.be.empty;
            done();
          });
      });

      it('ERROR: should return a no token error', (done) => {
        request(app)
          .get('/api/validate')
          .end((err, res) => {
            expect(res.statusCode).to.equal(401);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('code', 'NO_TOKEN_FOUND');
            expect(res.body).to.have.property('message', 'No Jwt token found in authorization header');
            expect(res.body).to.have.property('reqId');
            done();
          });
      });

      it('ERROR: should return an invalid token signature error', (done) => {
        request(app)
          .get('/api/validate')
          .set(config.accessTokenHeader, `bearer ${accessTokenBadSignature}`)
          .end((err, res) => {
            expect(res.statusCode).to.equal(401);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('code', 'INVALID_TOKEN_SIGNATURE');
            expect(res.body).to.have.property('message', 'Jwt token signature is invalid');
            expect(res.body).to.have.property('reqId');
            done();
          });
      });

      it('ERROR: should return an expired token error', (done) => {
        request(app)
          .get('/api/validate')
          .set(config.accessTokenHeader, `bearer ${accessTokenExpired}`)
          .end((err, res) => {
            expect(res.statusCode).to.equal(401);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('code', 'TOKEN_EXPIRED');
            expect(res.body).to.have.property('message', 'Jwt token has expired');
            expect(res.body).to.have.property('reqId');
            done();
          });
      });
    });

    describe('POST /api/log', () => {
      it('OK: Trace level, should return no content', (done) => {
        request(app)
        .post('/api/log/trace')
        .end((err, res) => {
          expect(res.statusCode).to.equal(204);
          expect(res.body).to.be.an('object');
          expect(res.body).to.be.empty;
          done();
        });
      });

      it('OK: Debug level, should return no content', (done) => {
        request(app)
          .post('/api/log/debug')
          .end((err, res) => {
            expect(res.statusCode).to.equal(204);
            expect(res.body).to.be.an('object');
            expect(res.body).to.be.empty;
            done();
          });
      });

      it('OK: Info level, should return no content', (done) => {
        request(app)
          .post('/api/log/info')
          .end((err, res) => {
            expect(res.statusCode).to.equal(204);
            expect(res.body).to.be.an('object');
            expect(res.body).to.be.empty;
            done();
          });
      });

      it('OK: Warn level, should return no content', (done) => {
        request(app)
          .post('/api/log/warn')
          .end((err, res) => {
            expect(res.statusCode).to.equal(204);
            expect(res.body).to.be.an('object');
            expect(res.body).to.be.empty;
            done();
          });
      });

      it('OK: Error level, should return no content', (done) => {
        request(app)
          .post('/api/log/error')
          .end((err, res) => {
            expect(res.statusCode).to.equal(204);
            expect(res.body).to.be.an('object');
            expect(res.body).to.be.empty;
            done();
          });
      });

      it('OK: Fatal level, should return no content', (done) => {
        request(app)
          .post('/api/log/fatal')
          .end((err, res) => {
            expect(res.statusCode).to.equal(204);
            expect(res.body).to.be.an('object');
            expect(res.body).to.be.empty;
            done();
          });
      });

      it('ERROR: should return a 500 error', (done) => {
        request(app)
          .post('/api/log/xxx')
          .end((err, res) => {
            expect(res.statusCode).to.equal(500);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('code', 'INTERNAL_SERVER_ERROR');
            expect(res.body).to.have.property('message', 'xxx is not a valid log level');
            expect(res.body).to.have.property('reqId');
            expect(res.body.reqId).to.match(uuid);
            done();
          });
      });
    });

    describe('OPTIONS /api/*', () => {
      it('OK: Deactivated CORS, should return no content', (done) => {
        request(app)
        .options('/api/login')
        .end((err, res) => {
          expect(res.statusCode).to.equal(204);
          expect(res.body).to.be.an('object');
          expect(res.body).to.be.empty;
          done();
        });
      });

      it('OK: Activated CORS, should return no content', (done) => {
        process.env.CORS_ORIGINS = ['localhost'];
        request(app)
        .options('/api/login')
        .set('origin', 'localhost')
        .end((err, res) => {
          process.env.CORS_ORIGINS = undefined;
          expect(res.statusCode).to.equal(204);
          expect(res.body).to.be.an('object');
          expect(res.body).to.be.empty;
          done();
        });
      });

      it('ERROR: should return a cors error', (done) => {
        process.env.CORS_ORIGINS = ['localhost'];
        request(app)
        .options('/api/login')
        .end((err, res) => {
          process.env.CORS_ORIGINS = undefined;
          expect(res.statusCode).to.equal(500);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('code', 'INTERNAL_SERVER_ERROR');
          expect(res.body).to.have.property('message', 'Not allowed by CORS');
          expect(res.body).to.have.property('reqId');
          expect(res.body.reqId).to.match(uuid);
          done();
        });
      });
    });
  });
};
