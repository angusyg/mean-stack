const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const camo = require('camo');
const { ValidationError } = require('camo/lib/errors');
const { validateId } = require('camo/test/util');
const User = require('./users');

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Module models/users', () => {
  it('should export User', (done) => {
    expect(User).to.be.a('function');
    done();
  });

  describe('Unit tests', () => {
    let database;
    before((done) => {
      camo.connect('nedb://memory')
        .then((db) => {
          database = db;
          done();
        });
    });

    afterEach((done) => {
      database.dropDatabase()
        .then(() => done());
    });

    after((done) => {
      database.dropDatabase()
        .then(() => done());
    });

    it('create(): should create an empty User', (done) => {
      const user = User.create();
      expect(user).to.have.own.property('login').to.be.undefined;
      expect(user).to.have.own.property('password').to.be.undefined;
      expect(user).to.have.own.property('roles').to.be.eql(['USER']);
      expect(user).to.have.own.property('refreshToken').to.be.empty;
      done();
    });

    it('create(u: Object): should create a User from u', (done) => {
      const user = User.create({
        login: 'LOGIN',
        password: 'PASSWORD',
        roles: ['ADMIN', 'USER'],
      });
      expect(user).to.have.own.property('login', 'LOGIN');
      expect(user).to.have.own.property('password', 'PASSWORD');
      expect(user).to.have.own.property('roles').to.be.eql(['ADMIN', 'USER']);
      expect(user).to.have.own.property('refreshToken').to.be.empty;
      done();
    });

    it('should allow to fill User after create()', (done) => {
      const user = User.create();
      user.login = 'LOGIN';
      user.password = 'PASSWORD';
      user.roles = ['ADMIN', 'USER'];
      user.refreshToken = 'TOKEN';
      expect(user).to.have.own.property('login', 'LOGIN');
      expect(user).to.have.own.property('password', 'PASSWORD');
      expect(user).to.have.own.property('roles').to.be.eql(['ADMIN', 'USER']);
      expect(user).to.have.own.property('refreshToken', 'TOKEN');
      done();
    });

    it('comparePassword(p: string): should compare p against encrypted User password', () => {
      const user = User.create({
        login: 'LOGIN',
        password: 'PASSWORD',
        roles: ['ADMIN', 'USER'],
      });
      user.preSave();
      return expect(user.comparePassword('PASSWORD')).to.eventually.to.be.true;
    });

    it('save(): should save User in database', () => {
      const user = User.create({
        login: 'LOGIN',
        password: 'PASSWORD',
        roles: ['ADMIN', 'USER'],
      });
      return user.save()
        .then(() => {
          validateId(user);
          expect(user).to.have.own.property('login', 'LOGIN');
          expect(user).to.have.own.property('roles').to.be.eql(['ADMIN', 'USER']);
          expect(user).to.have.own.property('refreshToken').to.be.empty;
          expect(user).to.have.own.property('password');
          return expect(user.comparePassword('PASSWORD')).to.eventually.to.be.true;
        });
    });

    it('save(): should reject with a ValidationError on empty login', (done) => {
      const user = User.create({
        password: 'PASSWORD',
        roles: ['ADMIN', 'USER'],
      });
      user.save()
        .catch((err) => {
          expect(err).to.be.an.instanceof(ValidationError);
          expect(err).to.have.own.property('message', 'Key users.login is required, but got undefined');
          done();
        });
    });

    it('save(): should reject with a ValidationError on empty password', (done) => {
      const user = User.create({
        login: 'LOGIN',
        roles: ['ADMIN', 'USER'],
      });
      user.save()
        .catch((err) => {
          expect(err).to.be.an.instanceof(ValidationError);
          expect(err).to.have.own.property('message', 'Key users.password is required, but got undefined');
          done();
        });
    });

    it('save(): should reject with a ValidationError on type of login not being String', (done) => {
      const user = User.create({
        login: 0,
        password: 'PASSWORD',
        roles: ['ADMIN', 'USER'],
      });
      user.save()
        .catch((err) => {
          expect(err).to.be.an.instanceof(ValidationError);
          expect(err).to.have.own.property('message', 'Value assigned to users.login should be String, got number');
          done();
        });
    });

    it('save(): should reject with a ValidationError on type of password not being String', (done) => {
      const user = User.create({
        login: 'LOGIN',
        password: 0,
        roles: ['ADMIN', 'USER'],
      });
      user.save()
        .catch((err) => {
          expect(err).to.be.an.instanceof(ValidationError);
          expect(err).to.have.own.property('message', 'Value assigned to users.password should be String, got number');
          done();
        });
    });

    it('save(): should reject with a ValidationError on type of roles not being [String]', (done) => {
      const user = User.create({
        login: 'LOGIN',
        password: 'PASSWORD',
        roles: [0],
      });
      user.save()
        .catch((err) => {
          expect(err).to.be.an.instanceof(ValidationError);
          expect(err).to.have.own.property('message', 'Value assigned to users.roles should be [String], got [0]');
          done();
        });
    });

    it('save(): should reject with a ValidationError on type of refreshToken not being String', (done) => {
      const user = User.create({
        login: 'LOGIN',
        password: 'PASSWORD',
        roles: ['ADMIN', 'USER'],
        refreshToken: 0,
      });
      user.save()
        .catch((err) => {
          expect(err).to.be.an.instanceof(ValidationError);
          expect(err).to.have.own.property('message', 'Value assigned to users.refreshToken should be String, got number');
          done();
        });
    });
  });
});
