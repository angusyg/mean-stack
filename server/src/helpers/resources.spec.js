const chai = require('chai');
const proxyquire = require('proxyquire');

const Resource = class Resource {
  constructor(name, document, config) {
    this.name = name;
    this.document = document;
    this.config = config;
    this.router = 'router';
  }
};
const resources = proxyquire('./resources', { '../models/resources': Resource });

const expect = chai.expect;

describe('Module helpers/resources', () => {
  it('should export addResource function', (done) => {
    expect(resources).to.have.own.property('addResource').to.be.a('function');
    done();
  });

  it('should export removeResource function', (done) => {
    expect(resources).to.have.own.property('removeResource').to.be.a('function');
    done();
  });

  it('should export getResource function', (done) => {
    expect(resources).to.have.own.property('getResource').to.be.a('function');
    done();
  });

  it('should export getResourceRouter function', (done) => {
    expect(resources).to.have.own.property('getResourceRouter').to.be.a('function');
    done();
  });

  describe('Unit tests', () => {
    const name = 'test';
    const document = 'document';
    const config = { global: { protected: true } };

    beforeEach((done) => {
      resources.removeResource(name);
      done();
    });

    it('addResource(): should create a new resource and add it to the resource map', (done) => {
      const resource = resources.addResource(name, document, config);
      expect(resource).to.be.instanceof(Resource);
      expect(resource).to.have.own.property('name', name);
      expect(resource).to.have.own.property('document', document);
      expect(resource).to.have.own.property('config').to.be.deep.equal(config);
      done();
    });

    it('getResource(name: string): should return a resource from the resource map', (done) => {
      resources.addResource(name, document, config);
      const resource = resources.getResource(name);
      expect(resource).to.be.instanceof(Resource);
      expect(resource).to.have.own.property('name', name);
      expect(resource).to.have.own.property('document', document);
      expect(resource).to.have.own.property('config').to.be.deep.equal(config);
      done();
    });

    it('getResourceRouter(name: string): should return a resource from the resource map', (done) => {
      resources.addResource(name, document, config);
      const router = resources.getResourceRouter(name);
      expect(router).to.be.equal('router');
      done();
    });
  });
});
