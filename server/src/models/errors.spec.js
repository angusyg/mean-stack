/* eslint no-unused-expressions: 0 */

const chai = require('chai');
const sinon = require('sinon');
const errors = require('./errors');

const {
  ApiError,
  NotFoundError,
  UnauthorizedAccessError,
  ForbiddenOperationError,
  JwtTokenExpiredError,
  NoJwtTokenError,
  JwtTokenSignatureError,
  NotFoundResourceError,
} = errors;
const expect = chai.expect;

describe('Module models/errors', () => {
  it('should export ApiError', (done) => {
    expect(errors).to.have.property('ApiError').to.be.a('function');
    done();
  });

  it('should export NotFoundError', (done) => {
    expect(errors).to.have.property('NotFoundError').to.be.a('function');
    done();
  });

  it('should export UnauthorizedAccessError', (done) => {
    expect(errors).to.have.property('UnauthorizedAccessError').to.be.a('function');
    done();
  });

  it('should export ForbiddenOperationError', (done) => {
    expect(errors).to.have.property('ForbiddenOperationError').to.be.a('function');
    done();
  });

  it('should export JwtTokenExpiredError', (done) => {
    expect(errors).to.have.property('JwtTokenExpiredError').to.be.a('function');
    done();
  });

  it('should export NoJwtTokenError', (done) => {
    expect(errors).to.have.property('NoJwtTokenError').to.be.a('function');
    done();
  });

  it('should export JwtTokenSignatureError', (done) => {
    expect(errors).to.have.property('JwtTokenSignatureError').to.be.a('function');
    done();
  });

  it('should export NotFoundResourceError', (done) => {
    expect(errors).to.have.property('NotFoundResourceError').to.be.a('function');
    done();
  });

  describe('Unit tests', () => {
    const status = sinon.stub();
    const json = sinon.spy();
    const req = { id: 'UUID' };
    let res;

    describe('ApiError', () => {
      beforeEach((done) => {
        res = { json, status };
        status.returns(res);
        done();
      });

      afterEach((done) => {
        status.reset();
        json.resetHistory();
        done();
      });

      it('constructor(): should return an ApiError', (done) => {
        const error = new ApiError();
        expect(error).to.be.an.instanceof(Error);
        expect(error).to.be.an.instanceof(ApiError);
        expect(error).to.have.property('name', 'ApiError');
        expect(error).to.have.property('statusCode', 500);
        expect(error).to.have.property('code', 'INTERNAL_SERVER_ERROR');
        expect(error).to.have.property('message', 'An unknown server error occured while processing request');
        done();
      });

      it('constructor(a: string): should return an ApiError with custom message', (done) => {
        const error = new ApiError('MESSAGE');
        expect(error).to.be.an.instanceof(Error);
        expect(error).to.be.an.instanceof(ApiError);
        expect(error).to.have.property('name', 'ApiError');
        expect(error).to.have.property('statusCode', 500);
        expect(error).to.have.property('code', 'INTERNAL_SERVER_ERROR');
        expect(error).to.have.property('message', 'MESSAGE');
        done();
      });

      it('constructor(a: Error): should return an ApiError with error message', (done) => {
        const error = new ApiError(new Error('MESSAGE'));
        expect(error).to.be.an.instanceof(Error);
        expect(error).to.be.an.instanceof(ApiError);
        expect(error).to.have.property('name', 'ApiError');
        expect(error).to.have.property('statusCode', 500);
        expect(error).to.have.property('code', 'INTERNAL_SERVER_ERROR');
        expect(error).to.have.property('message', 'MESSAGE');
        done();
      });

      it('constructor(a: string[2]): should return an ApiError with custom code and message', (done) => {
        const error = new ApiError(['CODE', 'MESSAGE']);
        expect(error).to.be.an.instanceof(Error);
        expect(error).to.be.an.instanceof(ApiError);
        expect(error).to.have.property('name', 'ApiError');
        expect(error).to.have.property('statusCode', 500);
        expect(error).to.have.property('code', 'CODE');
        expect(error).to.have.property('message', 'MESSAGE');
        done();
      });

      it('constructor(a: boolean|number|Object): should throw a TypeError', (done) => {
        expect(() => new ApiError(0)).to.throw(TypeError, 'Invalid type \'number\' for new ApiError argument');
        done();
      });

      it('constructor(a: string, b: string): should return an ApiError with custom code and message', (done) => {
        const error = new ApiError('CODE', 'MESSAGE');
        expect(error).to.be.an.instanceof(Error);
        expect(error).to.be.an.instanceof(ApiError);
        expect(error).to.have.property('name', 'ApiError');
        expect(error).to.have.property('statusCode', 500);
        expect(error).to.have.property('code', 'CODE');
        expect(error).to.have.property('message', 'MESSAGE');
        done();
      });

      it('constructor(a: boolean|number|Object, b: string): should throw a TypeError', (done) => {
        expect(() => new ApiError(0, 'MESSAGE')).to.throw(TypeError, 'Invalid type \'number\' for new ApiError first argument');
        done();
      });

      it('constructor(a: string, b: boolean|number|Object): should throw a TypeError', (done) => {
        expect(() => new ApiError('CODE', 0)).to.throw(TypeError, 'Invalid type \'number\' for new ApiError second argument');
        done();
      });

      it('send(req: Request, res: Response): should send an ApiError as request response', (done) => {
        new ApiError().send(req, res);
        expect(status.calledOnce).to.be.true;
        expect(status.calledWith(500)).to.be.ok;
        expect(json.calledOnce).to.be.true;
        expect(json.calledWith({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unknown server error occured while processing request',
          reqId: 'UUID',
        })).to.be.ok;
        done();
      });

      it('handle(req: Request, res: Response, err: Error): should handle an Error and send an ApiError as request response', (done) => {
        ApiError.handle(req, res, new Error('MESSAGE'));
        expect(status.calledOnce).to.be.true;
        expect(status.calledWith(500)).to.be.ok;
        expect(json.calledOnce).to.be.true;
        expect(json.calledWith({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'MESSAGE',
          reqId: 'UUID',
        })).to.be.ok;
        done();
      });

      it('handle(req: Request, res: Response, err: ApiError): should handle an ApiError and send it as request response', (done) => {
        ApiError.handle(req, res, new ApiError('MESSAGE'));
        expect(status.calledOnce).to.be.true;
        expect(status.calledWith(500)).to.be.ok;
        expect(json.calledOnce).to.be.true;
        expect(json.calledWith({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'MESSAGE',
          reqId: 'UUID',
        })).to.be.ok;
        done();
      });
    });

    describe('UnauthorizedAccessError', () => {
      it('constructor(): should return an UnauthorizedAccessError', (done) => {
        const error = new UnauthorizedAccessError();
        expect(error).to.be.an.instanceof(Error);
        expect(error).to.be.an.instanceof(ApiError);
        expect(error).to.be.an.instanceof(UnauthorizedAccessError);
        expect(error).to.have.property('name', 'UnauthorizedAccessError');
        expect(error).to.have.property('statusCode', 401);
        expect(error).to.have.property('code', 'UNAUTHORIZED');
        expect(error).to.have.property('message', 'Unauthorized');
        done();
      });

      it('constructor(a: string): should return an UnauthorizedAccessError with custom message', (done) => {
        const error = new UnauthorizedAccessError('MESSAGE');
        expect(error).to.be.an.instanceof(Error);
        expect(error).to.be.an.instanceof(ApiError);
        expect(error).to.be.an.instanceof(UnauthorizedAccessError);
        expect(error).to.have.property('name', 'UnauthorizedAccessError');
        expect(error).to.have.property('statusCode', 401);
        expect(error).to.have.property('code', 'UNAUTHORIZED');
        expect(error).to.have.property('message', 'MESSAGE');
        done();
      });

      it('constructor(a: string, b: string): should return an UnauthorizedAccessError with custom code and message', (done) => {
        const error = new UnauthorizedAccessError('CODE', 'MESSAGE');
        expect(error).to.be.an.instanceof(Error);
        expect(error).to.be.an.instanceof(ApiError);
        expect(error).to.be.an.instanceof(UnauthorizedAccessError);
        expect(error).to.have.property('name', 'UnauthorizedAccessError');
        expect(error).to.have.property('statusCode', 401);
        expect(error).to.have.property('code', 'CODE');
        expect(error).to.have.property('message', 'MESSAGE');
        done();
      });

      it('constructor(a: boolean|number|Object): should throw a TypeError', (done) => {
        expect(() => new UnauthorizedAccessError(0)).to.throw(TypeError, 'Invalid type \'number\' for new ApiError second argument');
        done();
      });

      it('constructor(a: boolean|number|Object, b: string): should throw a TypeError', (done) => {
        expect(() => new UnauthorizedAccessError(0, 'MESSAGE')).to.throw(TypeError, 'Invalid type \'number\' for new ApiError first argument');
        done();
      });

      it('constructor(a: string, b: boolean|number|Object): should throw a TypeError', (done) => {
        expect(() => new UnauthorizedAccessError('CODE', 0)).to.throw(TypeError, 'Invalid type \'number\' for new ApiError second argument');
        done();
      });

      it('constructor(any[>2]): should return an UnauthorizedAccessError', (done) => {
        const error = new UnauthorizedAccessError('a', 'b', 0);
        expect(error).to.be.an.instanceof(Error);
        expect(error).to.be.an.instanceof(ApiError);
        expect(error).to.be.an.instanceof(UnauthorizedAccessError);
        expect(error).to.have.property('name', 'UnauthorizedAccessError');
        expect(error).to.have.property('statusCode', 401);
        expect(error).to.have.property('code', 'UNAUTHORIZED');
        expect(error).to.have.property('message', 'Unauthorized');
        done();
      });
    });

    describe('NotFoundError', () => {
      it('constructor(): should return a NotFoundError', (done) => {
        const error = new NotFoundError();
        expect(error).to.be.an.instanceof(Error);
        expect(error).to.be.an.instanceof(ApiError);
        expect(error).to.be.an.instanceof(NotFoundError);
        expect(error).to.have.property('name', 'NotFoundError');
        expect(error).to.have.property('statusCode', 404);
        expect(error).to.have.property('code', 'NOT_FOUND');
        expect(error).to.have.property('message', 'Not Found');
        done();
      });
    });

    describe('ForbiddenOperationError', () => {
      it('constructor(): should return a ForbiddenOperationError', (done) => {
        const error = new ForbiddenOperationError();
        expect(error).to.be.an.instanceof(Error);
        expect(error).to.be.an.instanceof(ApiError);
        expect(error).to.be.an.instanceof(ForbiddenOperationError);
        expect(error).to.have.property('name', 'ForbiddenOperationError');
        expect(error).to.have.property('statusCode', 403);
        expect(error).to.have.property('code', 'FORBIDDEN_OPERATION');
        expect(error).to.have.property('message', 'Forbidden');
        done();
      });
    });

    describe('JwtTokenExpiredError', () => {
      it('constructor(): should return a JwtTokenExpiredError', (done) => {
        const error = new JwtTokenExpiredError();
        expect(error).to.be.an.instanceof(Error);
        expect(error).to.be.an.instanceof(ApiError);
        expect(error).to.be.an.instanceof(JwtTokenExpiredError);
        expect(error).to.have.property('name', 'JwtTokenExpiredError');
        expect(error).to.have.property('statusCode', 401);
        expect(error).to.have.property('code', 'TOKEN_EXPIRED');
        expect(error).to.have.property('message', 'Jwt token has expired');
        done();
      });
    });

    describe('NoJwtTokenError', () => {
      it('constructor(): should return a NoJwtTokenError', (done) => {
        const error = new NoJwtTokenError();
        expect(error).to.be.an.instanceof(Error);
        expect(error).to.be.an.instanceof(ApiError);
        expect(error).to.be.an.instanceof(NoJwtTokenError);
        expect(error).to.have.property('name', 'NoJwtTokenError');
        expect(error).to.have.property('statusCode', 401);
        expect(error).to.have.property('code', 'NO_TOKEN_FOUND');
        expect(error).to.have.property('message', 'No Jwt token found in authorization header');
        done();
      });
    });

    describe('JwtTokenSignatureError', () => {
      it('constructor(): should return a JwtTokenSignatureError', (done) => {
        const error = new JwtTokenSignatureError();
        expect(error).to.be.an.instanceof(Error);
        expect(error).to.be.an.instanceof(ApiError);
        expect(error).to.be.an.instanceof(JwtTokenSignatureError);
        expect(error).to.have.property('name', 'JwtTokenSignatureError');
        expect(error).to.have.property('statusCode', 401);
        expect(error).to.have.property('code', 'INVALID_TOKEN_SIGNATURE');
        expect(error).to.have.property('message', 'Jwt token signature is invalid');
        done();
      });
    });

    describe('NotFoundResourceError', () => {
      it('constructor(): should return a NotFoundResourceError', (done) => {
        const error = new NotFoundResourceError('ID');
        expect(error).to.be.an.instanceof(Error);
        expect(error).to.be.an.instanceof(ApiError);
        expect(error).to.be.an.instanceof(NotFoundResourceError);
        expect(error).to.have.property('name', 'NotFoundResourceError');
        expect(error).to.have.property('statusCode', 404);
        expect(error).to.have.property('code', 'RESOURCE_NOT_FOUND');
        expect(error).to.have.property('message', 'No resource found with id \'ID\'');
        done();
      });
    });
  });
});
