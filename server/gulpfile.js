const gulp = require('gulp');
const pump = require('pump');
const plugins = require('gulp-load-plugins')();
const gutil = require('gulp-util');
const runSequence = require('run-sequence');
const jsdocConfig = require('./jsdoc.json');

const sources = [
  'README.md',
  'jsdoc-externals.js',
  'src/bin/www',
  'src/**/*.js',
];
const lintJs = [
  'src/**/*.js',
  'test/**/*.js',
];
const pumpPromise = streams => new Promise((resolve, reject) => {
  pump(streams, (err) => {
    if (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
      reject(err);
    } else resolve();
  });
});

// Creates JSDoc
gulp.task('jsdoc', (cb) => {
  gulp.src(sources, { read: false })
    .pipe(plugins.jsdoc3(jsdocConfig, cb));
});

// Validates js files
gulp.task('lint', () => pumpPromise([
  gulp.src(lintJs),
  plugins.eslint(),
  plugins.eslint.format('stylish'),
  plugins.eslint.failAfterError(),
]));

// Default task
gulp.task('default', callback => runSequence('lint', 'jsdoc', callback));
