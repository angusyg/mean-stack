/* eslint import/no-extraneous-dependencies: 0 */

const chai = require('chai');
const chaiHttp = require('chai-http');
const request = require('supertest');
const jsonwebtoken = require('jsonwebtoken');
const User = require('../../src/models/users');

chai.use(chaiHttp);
const expect = chai.expect;

function compareUser(u1, u2) {
  return u1.login === u2.login
    && u1._id === u2.id
    && u1.roles.sort().toString() === u2.roles.sort().toString();
}

function compareNoIdUser(user1, u2) {
  return user1.login === u2.login && user1.roles.sort().toString() === u2.roles.sort().toString();
}

module.exports = (app, config) => {
  describe('User resource integration tests', () => {
    describe('GET /api/Users', () => {
      const userTest1 = {
        login: 'TEST1',
        password: 'TEST1',
        roles: ['USER'],
      };
      const userTest2 = {
        login: 'TEST2',
        password: 'TEST2',
        roles: ['TEST'],
      };
      let accessTokenUser1;
      let accessTokenUser2;

      before((done) => {
        Promise.all([
            User.create(userTest1),
            User.create(userTest2),
          ])
          .then((res) => {
            userTest1.id = res[0]._id.toString();
            userTest2.id = res[1]._id.toString();
            accessTokenUser1 = jsonwebtoken.sign(userTest1, config.tokenSecretKey, { expiresIn: config.accessTokenExpirationTime });
            accessTokenUser2 = jsonwebtoken.sign(userTest2, config.tokenSecretKey, { expiresIn: config.accessTokenExpirationTime });
            done();
          })
          .catch(err => done(err));
      });

      after((done) => {
        User.remove({})
          .then(() => done())
          .catch(err => done(err));
      });

      it('OK: returns a list of users', (done) => {
        request(app)
          .get('/api/Users')
          .set(config.accessTokenHeader, `bearer ${accessTokenUser1}`)
          .end((err, res) => {
            expect(res.statusCode).to.equal(200);
            expect(res).to.be.json;
            expect(res.body).to.be.an('array').to.have.lengthOf(2);
            expect(res.body.some(element => compareUser(element, userTest1))).to.be.true;
            expect(res.body.some(element => compareUser(element, userTest2))).to.be.true;
            done();
          });
      });

      it('OK: Sort reversed, returns a list of users ordered by reversed login', (done) => {
        request(app)
          .get('/api/Users?sort=-login')
          .set(config.accessTokenHeader, `bearer ${accessTokenUser1}`)
          .end((err, res) => {
            expect(res.statusCode).to.equal(200);
            expect(res).to.be.json;
            expect(res.body).to.be.an('array').to.have.lengthOf(2);
            expect(compareUser(res.body[0], userTest2)).to.be.true;
            expect(compareUser(res.body[1], userTest1)).to.be.true;
            done();
          });
      });

      it('OK: Sort, returns a list of users ordered by login', (done) => {
        request(app)
          .get('/api/Users?sort=login')
          .set(config.accessTokenHeader, `bearer ${accessTokenUser1}`)
          .end((err, res) => {
            expect(res.statusCode).to.equal(200);
            expect(res).to.be.json;
            expect(res.body).to.be.an('array').to.have.lengthOf(2);
            expect(compareUser(res.body[0], userTest1)).to.be.true;
            expect(compareUser(res.body[1], userTest2)).to.be.true;
            done();
          });
      });

      it('OK: Skip, returns a list of users with first skipped', (done) => {
        request(app)
          .get('/api/Users?sort=login&skip=1')
          .set(config.accessTokenHeader, `bearer ${accessTokenUser1}`)
          .end((err, res) => {
            expect(res.statusCode).to.equal(200);
            expect(res).to.be.json;
            expect(res.body).to.be.an('array').to.have.lengthOf(1);
            expect(compareUser(res.body[0], userTest2)).to.be.true;
            done();
          });
      });

      it('OK: Limit, returns a list of users limited to 1', (done) => {
        request(app)
          .get('/api/Users?sort=login&limit=1')
          .set(config.accessTokenHeader, `bearer ${accessTokenUser1}`)
          .end((err, res) => {
            expect(res.statusCode).to.equal(200);
            expect(res).to.be.json;
            expect(res.body).to.be.an('array').to.have.lengthOf(1);
            expect(compareUser(res.body[0], userTest1)).to.be.true;
            done();
          });
      });

      it('OK: Query, returns a list of users filtered on login', (done) => {
        request(app)
          .get(`/api/Users?query={"login":"${userTest1.login}"}`)
          .set(config.accessTokenHeader, `bearer ${accessTokenUser1}`)
          .end((err, res) => {
            expect(res.statusCode).to.equal(200);
            expect(res).to.be.json;
            expect(res.body).to.be.an('array').to.have.lengthOf(1);
            expect(compareUser(res.body[0], userTest1)).to.be.true;
            done();
          });
      });

      it('OK: Select, returns only users login', (done) => {
        request(app)
          .get('/api/Users?select=login&limit=1&sort=login')
          .set(config.accessTokenHeader, `bearer ${accessTokenUser1}`)
          .end((err, res) => {
            expect(res.statusCode).to.equal(200);
            expect(res).to.be.json;
            expect(res.body).to.be.an('array').to.have.lengthOf(1);
            expect(res.body[0]).to.have.property('login', userTest1.login);
            expect(res.body[0]).to.not.have.property('roles');
            done();
          });
      });

      // it('OK: Populate, returns a list of users with populated settings', (done) => {
      //   request(app)
      //     .get('/api/Users?populate=settings')
      //     .set(config.accessTokenHeader, `bearer ${accessTokenUser1}`)
      //     .end((err, res) => {
      //       expect(res.statusCode).to.equal(200);
      //       expect(res).to.be.json;
      //       expect(res.body).to.be.an('array').to.have.lengthOf(1);
      //       expect(compareUser(res.body[0], userTest1)).to.be.true;
      //       done();
      //     });
      // });

      it('OK: Distinct, returns a list of distincts users login', (done) => {
        request(app)
          .get('/api/Users?distinct=login')
          .set(config.accessTokenHeader, `bearer ${accessTokenUser1}`)
          .end((err, res) => {
            expect(res.statusCode).to.equal(200);
            expect(res).to.be.json;
            expect(res.body).to.be.an('array').to.have.lengthOf(2);
            expect(res.body.some(element => element === userTest1.login)).to.be.true;
            expect(res.body.some(element => element === userTest2.login)).to.be.true;
            done();
          });
      });

      it('ERROR: returns a no token error', (done) => {
        request(app)
          .get('/api/Users')
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

      it('ERROR: returns a forbidden error (bad role)', (done) => {
        request(app)
          .get('/api/Users')
          .set(config.accessTokenHeader, `bearer ${accessTokenUser2}`)
          .end((err, res) => {
            expect(res.statusCode).to.equal(403);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('code', 'FORBIDDEN_OPERATION');
            expect(res.body).to.have.property('message', 'Forbidden');
            expect(res.body).to.have.property('reqId');
            done();
          });
      });
    });

    describe('GET /api/Users/:id', () => {
      const userTest1 = {
        login: 'TEST1',
        password: 'TEST1',
        roles: ['USER'],
      };
      const userTest2 = {
        login: 'TEST2',
        password: 'TEST2',
        roles: ['TEST'],
      };
      let accessTokenUser1;
      let accessTokenUser2;

      before((done) => {
        Promise.all([
            User.create(userTest1),
            User.create(userTest2),
          ])
          .then((res) => {
            userTest1.id = res[0]._id.toString();
            userTest2.id = res[1]._id.toString();
            accessTokenUser1 = jsonwebtoken.sign(userTest1, config.tokenSecretKey, { expiresIn: config.accessTokenExpirationTime });
            accessTokenUser2 = jsonwebtoken.sign(userTest2, config.tokenSecretKey, { expiresIn: config.accessTokenExpirationTime });
            done();
          })
          .catch(err => done(err));
      });

      after((done) => {
        User.remove({})
          .then(() => done())
          .catch(err => done(err));
      });

      it('OK: returns a user by id', (done) => {
        request(app)
          .get(`/api/Users/${userTest1.id}`)
          .set(config.accessTokenHeader, `bearer ${accessTokenUser1}`)
          .end((err, res) => {
            expect(res.statusCode).to.equal(200);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(compareUser(res.body, userTest1)).to.be.true;
            done();
          });
      });

      it('ERROR: returns a not found resource error', (done) => {
        const id = 'xxx';
        request(app)
          .get(`/api/Users/${id}`)
          .set(config.accessTokenHeader, `bearer ${accessTokenUser1}`)
          .end((err, res) => {
            expect(res.statusCode).to.equal(404);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('code', 'RESOURCE_NOT_FOUND');
            expect(res.body).to.have.property('message', `No resource found with id '${id}'`);
            expect(res.body).to.have.property('reqId');
            done();
          });
      });

      it('ERROR: returns a no token error', (done) => {
        request(app)
          .get(`/api/Users/${userTest1.id}`)
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

      it('ERROR: returns a forbidden error (bad role)', (done) => {
        request(app)
          .get(`/api/Users/${userTest1.id}`)
          .set(config.accessTokenHeader, `bearer ${accessTokenUser2}`)
          .end((err, res) => {
            expect(res.statusCode).to.equal(403);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('code', 'FORBIDDEN_OPERATION');
            expect(res.body).to.have.property('message', 'Forbidden');
            expect(res.body).to.have.property('reqId');
            done();
          });
      });
    });

    describe('POST /api/Users', () => {
      const userTest1 = {
        login: 'TEST1',
        password: 'TEST1',
        roles: ['USER'],
      };
      const userTest2 = {
        login: 'TEST2',
        password: 'TEST2',
        roles: ['TEST'],
      };
      const userTest3 = {
        login: 'TEST3',
        password: 'TEST3',
        roles: ['USER'],
      };
      let accessTokenUser1;
      let accessTokenUser2;

      before((done) => {
        Promise.all([
            User.create(userTest1),
            User.create(userTest2),
          ])
          .then((res) => {
            userTest1.id = res[0]._id.toString();
            userTest2.id = res[1]._id.toString();
            accessTokenUser1 = jsonwebtoken.sign(userTest1, config.tokenSecretKey, { expiresIn: config.accessTokenExpirationTime });
            accessTokenUser2 = jsonwebtoken.sign(userTest2, config.tokenSecretKey, { expiresIn: config.accessTokenExpirationTime });
            done();
          })
          .catch(err => done(err));
      });

      after((done) => {
        User.remove({})
          .then(() => done())
          .catch(err => done(err));
      });

      it('OK: creates a new user', (done) => {
        request(app)
          .post('/api/Users')
          .send(userTest3)
          .set(config.accessTokenHeader, `bearer ${accessTokenUser1}`)
          .end((err, res) => {
            expect(res.statusCode).to.equal(201);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(compareNoIdUser(res.body, userTest3)).to.be.true;
            expect(res.body).to.have.property('_id');
            done();
          });
      });

      it('ERROR: returns a no token error', (done) => {
        request(app)
          .post('/api/Users')
          .send(userTest3)
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

      it('ERROR: returns a forbidden error (bad role)', (done) => {
        request(app)
          .post('/api/Users')
          .send(userTest3)
          .set(config.accessTokenHeader, `bearer ${accessTokenUser2}`)
          .end((err, res) => {
            expect(res.statusCode).to.equal(403);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('code', 'FORBIDDEN_OPERATION');
            expect(res.body).to.have.property('message', 'Forbidden');
            expect(res.body).to.have.property('reqId');
            done();
          });
      });

      it('ERROR: returns an internal error for non unicity on login key', (done) => {
        request(app)
          .post('/api/Users')
          .send(userTest3)
          .set(config.accessTokenHeader, `bearer ${accessTokenUser1}`)
          .end((err, res) => {
            expect(res.statusCode).to.equal(500);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('code', 'INTERNAL_SERVER_ERROR');
            expect(res.body).to.have.property('message', 'E11000 duplicate key error collection: test-integration.users index: login_1 dup key: { : "TEST3" }');
            expect(res.body).to.have.property('reqId');
            done();
          });
      });

      it('ERROR: returns an internal error for missing fields', (done) => {
        request(app)
          .post('/api/Users')
          .send({})
          .set(config.accessTokenHeader, `bearer ${accessTokenUser1}`)
          .end((err, res) => {
            expect(res.statusCode).to.equal(500);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('code', 'INTERNAL_SERVER_ERROR');
            expect(res.body).to.have.property('message', 'User validation failed: password: Path `password` is required., login: Path `login` is required.');
            expect(res.body).to.have.property('reqId');
            done();
          });
      });
    });

    describe('PATCH /api/Users/:id', () => {
      const userTest1 = {
        login: 'TEST1',
        password: 'TEST1',
        roles: ['USER'],
      };
      const userTest2 = {
        login: 'TEST2',
        password: 'TEST2',
        roles: ['TEST'],
      };
      const userTest3 = {
        login: 'TEST3',
        password: 'TEST3',
        roles: ['USER'],
      };
      let accessTokenUser1;
      let accessTokenUser2;

      before((done) => {
        Promise.all([
            User.create(userTest1),
            User.create(userTest2),
            User.create(userTest3),
          ])
          .then((res) => {
            userTest1.id = res[0]._id.toString();
            userTest2.id = res[1]._id.toString();
            userTest3.id = res[2]._id.toString();
            accessTokenUser1 = jsonwebtoken.sign(userTest1, config.tokenSecretKey, { expiresIn: config.accessTokenExpirationTime });
            accessTokenUser2 = jsonwebtoken.sign(userTest2, config.tokenSecretKey, { expiresIn: config.accessTokenExpirationTime });
            done();
          })
          .catch(err => done(err));
      });

      after((done) => {
        User.remove({})
          .then(() => done())
          .catch(err => done(err));
      });

      it('OK: updates a user', (done) => {
        const newLogin = 'test2-new';
        request(app)
          .patch(`/api/Users/${userTest3.id}`)
          .send({ login: newLogin })
          .set(config.accessTokenHeader, `bearer ${accessTokenUser1}`)
          .end((err, res) => {
            expect(res.statusCode).to.equal(200);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('login', newLogin);
            done();
          });
      });

      it('ERROR: returns a no token error', (done) => {
        request(app)
          .patch(`/api/Users/${userTest2.id}`)
          .send({})
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

      it('ERROR: returns a forbidden error (bad role)', (done) => {
        request(app)
          .patch(`/api/Users/${userTest2.id}`)
          .send({ login: 'LOGIN' })
          .set(config.accessTokenHeader, `bearer ${accessTokenUser2}`)
          .end((err, res) => {
            expect(res.statusCode).to.equal(403);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('code', 'FORBIDDEN_OPERATION');
            expect(res.body).to.have.property('message', 'Forbidden');
            expect(res.body).to.have.property('reqId');
            done();
          });
      });

      it('ERROR: returns an internal error for non unicity on login key', (done) => {
        request(app)
          .patch(`/api/Users/${userTest2.id}`)
          .send({ login: userTest1.login })
          .set(config.accessTokenHeader, `bearer ${accessTokenUser1}`)
          .end((err, res) => {
            expect(res.statusCode).to.equal(500);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('code', 'INTERNAL_SERVER_ERROR');
            expect(res.body).to.have.property('message', 'E11000 duplicate key error collection: test-integration.users index: login_1 dup key: { : "TEST1" }');
            expect(res.body).to.have.property('reqId');
            done();
          });
      });
    });

    describe('DELETE /api/Users/:id', () => {
      const userTest1 = {
        login: 'TEST1',
        password: 'TEST1',
        roles: ['USER'],
      };
      const userTest2 = {
        login: 'TEST2',
        password: 'TEST2',
        roles: ['TEST'],
      };
      const userTest3 = {
        login: 'TEST3',
        password: 'TEST3',
        roles: ['TEST'],
      };
      let accessTokenUser1;
      let accessTokenUser2;

      before((done) => {
        Promise.all([
            User.create(userTest1),
            User.create(userTest2),
            User.create(userTest3),
          ])
          .then((res) => {
            userTest1.id = res[0]._id.toString();
            userTest2.id = res[1]._id.toString();
            userTest3.id = res[2]._id.toString();
            accessTokenUser1 = jsonwebtoken.sign(userTest1, config.tokenSecretKey, { expiresIn: config.accessTokenExpirationTime });
            accessTokenUser2 = jsonwebtoken.sign(userTest2, config.tokenSecretKey, { expiresIn: config.accessTokenExpirationTime });
            done();
          })
          .catch(err => done(err));
      });

      after((done) => {
        User.remove({})
          .then(() => done())
          .catch(err => done(err));
      });

      it('OK: deletes a user', (done) => {
        request(app)
          .delete(`/api/Users/${userTest3.id}`)
          .set(config.accessTokenHeader, `bearer ${accessTokenUser1}`)
          .end((err, res) => {
            expect(res.statusCode).to.equal(204);
            done();
          });
      });

      it('ERROR: returns a no token error', (done) => {
        request(app)
          .delete(`/api/Users/${userTest2.id}`)
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

      it('ERROR: returns a forbidden error (bad role)', (done) => {
        request(app)
          .delete(`/api/Users/${userTest1.id}`)
          .set(config.accessTokenHeader, `bearer ${accessTokenUser2}`)
          .end((err, res) => {
            expect(res.statusCode).to.equal(403);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('code', 'FORBIDDEN_OPERATION');
            expect(res.body).to.have.property('message', 'Forbidden');
            expect(res.body).to.have.property('reqId');
            done();
          });
      });

      it('ERROR: returns a not found resource error', (done) => {
        const id = 'test';
        request(app)
          .delete(`/api/Users/${id}`)
          .set(config.accessTokenHeader, `bearer ${accessTokenUser1}`)
          .end((err, res) => {
            expect(res.statusCode).to.equal(404);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('code', 'RESOURCE_NOT_FOUND');
            expect(res.body).to.have.property('message', `No resource found with id '${id}'`);
            expect(res.body).to.have.property('reqId');
            done();
          });
      });
    });
  });
};
