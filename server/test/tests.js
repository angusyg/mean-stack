process.env.DB_NAME = 'test-integration';
process.env.TOKEN_SECRET = 'TOKEN_SECRET';

const config = require('../src/config/api');
const app = require('../src/app');
const baseTI = require('./api/base');
const usersTI = require('./api/users');

describe('API integration tests', () => {
  let server;

  before((done) => {
    app.on('appStarted', () => done());
    server = require('../src/bin/www'); // eslint-disable-line global-require
  });

  after(done => server.close(() => done()));

  describe('Integration tests', () => {
    baseTI(app, config);
    usersTI(app, config);
  });
});
