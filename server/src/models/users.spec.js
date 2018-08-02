/* eslint no-unused-expressions: 0 */

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const restify = require('express-restify-mongoose');
const User = require('./users');

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Module models/users', () => {
  it('should export User', (done) => {
    expect(User).to.be.a('function');
    done();
  });

  describe('Unit tests', () => {
    const userTest = {
      login: 'TEST',
      password: 'PASSWORD',
      roles: ['ADMIN', 'USER'],
    };
    const router = {};
    const restifyStub = sinon.stub(restify, 'serve');

    afterEach((done) => {
      restifyStub.reset();
      done();
    });

    after((done) => {
      restify.serve.restore();
      done();
    });

    it('new(): should create an empty User', (done) => {
      const user = new User();
      expect(user).to.have.property('login').to.be.undefined;
      expect(user).to.have.property('password').to.be.undefined;
      expect(user).to.have.property('roles').to.be.eql(['USER']);
      expect(user).to.have.property('settings').to.deep.include({ theme: 'theme-default' });
      expect(user).to.have.property('refreshToken').to.be.empty;
      done();
    });

    it('new(u: Object): should create a User from u', (done) => {
      const user = new User(userTest);
      expect(user).to.have.property('login', userTest.login);
      expect(user).to.have.property('password', userTest.password);
      expect(user).to.have.property('roles').to.be.eql(userTest.roles);
      expect(user).to.have.property('settings').to.deep.include({ theme: 'theme-default' });
      expect(user).to.have.property('refreshToken').to.be.empty;
      done();
    });

    it('should allow to fill User after new()', (done) => {
      const user = new User();
      user.login = userTest.login;
      user.password = userTest.password;
      user.roles = userTest.roles;
      user.refreshToken = 'TOKEN';
      expect(user).to.have.property('login', userTest.login);
      expect(user).to.have.property('password', userTest.password);
      expect(user).to.have.property('roles').to.be.eql(userTest.roles);
      expect(user).to.have.property('settings').to.deep.include({ theme: 'theme-default' });
      expect(user).to.have.property('refreshToken', 'TOKEN');
      done();
    });

    it('validate(): should reject with a ValidationError on empty login', (done) => {
      const user = new User({
        password: 'PASSWORD',
        roles: ['ADMIN', 'USER'],
      });
      user.validate((err) => {
        expect(err.errors.login).to.exist;
        expect(err.errors.login).to.have.own.property('message', 'Path `login` is required.');
        done();
      });
    });

    it('validate(): should reject with a ValidationError on empty password', (done) => {
      const user = new User({
        login: 'TEST',
        roles: ['ADMIN', 'USER'],
      });
      user.validate((err) => {
        expect(err.errors.password).to.exist;
        expect(err.errors.password).to.have.own.property('message', 'Path `password` is required.');
        done();
      });
    });

    it('restify(router: Router): should add REST User resource to router', (done) => {
      User.restify(router);
      expect(restifyStub.calledOnce).to.be.true;
      expect(restifyStub.getCall(0).args[2]).to.have.own.property('name', 'Users');
      expect(restifyStub.getCall(0).args[2]).to.have.own.property('private').to.include.members(['refreshToken']);
      expect(restifyStub.getCall(0).args[2]).to.have.own.property('protected').to.include.members(['password']);
      expect(restifyStub.getCall(0).args[2]).to.not.have.property('preMiddleware').to.be.true;
      done();
    });

    it('restify(router: Router, preMiddleware: Function): should add REST User resource to router with preMiddleware', (done) => {
      const pm = sinon.stub();
      User.restify(router, pm);
      expect(restifyStub.calledOnce).to.be.true;
      expect(restifyStub.getCall(0).args[2]).to.have.own.property('name', 'Users');
      expect(restifyStub.getCall(0).args[2]).to.have.own.property('private').to.include.members(['refreshToken']);
      expect(restifyStub.getCall(0).args[2]).to.have.own.property('protected').to.include.members(['password']);
      expect(restifyStub.getCall(0).args[2]).to.have.own.property('preMiddleware', pm);
      done();
    });
  });
});
