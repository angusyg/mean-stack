const chai = require('chai');
const Resource = require('./resources');

const expect = chai.expect;

describe('Module models/resources', () => {
  it('should export Resource', (done) => {
    expect(Resource).to.be.a('function');
    done();
  });

  describe('Unit tests', () => {
    const Document = class Document {
      constructor() {}
    };

    it('constructor(name: empty|null, document: Document, config: Object): should throw a TypeError on name not found', (done) => {
      try {
        new Resource(null, Document, {});
      } catch (err) {
        expect(err).to.be.instanceof(TypeError);
        expect(err).to.have.own.property('message', 'No Resource name found');
        done();
      }
    });

    it('constructor(name: string, document: null, config: Object): should throw a TypeError on document not found', (done) => {
      try {
        new Resource('name', null, {});
      } catch (err) {
        expect(err).to.be.instanceof(TypeError);
        expect(err).to.have.own.property('message', 'No document associated to the new Resource');
        done();
      }
    });

    it('constructor(name: string, document: string, config: Object): should throw a TypeError on document not a function', (done) => {
      try {
        new Resource('name', 'document', {});
      } catch (err) {
        expect(err).to.be.instanceof(TypeError);
        expect(err).to.have.own.property('message', 'Resource document must be a function');
        done();
      }
    });

    it('constructor(name: string, document: Document, config: Object): should creates a new Resource', (done) => {
      const resource = new Resource('name', Document, {});
      expect(resource).to.be.instanceof(Resource);
      expect(resource).to.have.own.property('name', 'name');
      expect(resource).to.have.own.property('document', Document);
      expect(resource).to.have.own.property('config').to.be.deep.equal({});
      expect(resource).to.have.own.property('router');
      expect(resource.router.stack).to.have.lengthOf(5);
      expect(resource.router.stack[0].route).to.have.own.property('path', '/');
      expect(resource.router.stack[0].route.stack[0]).to.have.own.property('method', 'get');
      expect(resource.router.stack[1].route).to.have.own.property('path', '/:id');
      expect(resource.router.stack[1].route.stack[0]).to.have.own.property('method', 'get');
      expect(resource.router.stack[2].route).to.have.own.property('path', '/');
      expect(resource.router.stack[2].route.stack[0]).to.have.own.property('method', 'post');
      expect(resource.router.stack[3].route).to.have.own.property('path', '/:id');
      expect(resource.router.stack[3].route.stack[0]).to.have.own.property('method', 'put');
      expect(resource.router.stack[4].route).to.have.own.property('path', '/:id');
      expect(resource.router.stack[4].route.stack[0]).to.have.own.property('method', 'delete');
      done();
    });
  });
});
