'use strict';

const objectAssign = require('object-assign');
const through = require('through2');
const defaultPug = require('pug');
const ext = require('replace-ext');
const PluginError = require('plugin-error');
const log = require('fancy-log');

module.exports = function gulpPug(options) {
  const opts = objectAssign({}, options);
  const pug = opts.pug || opts.jade || defaultPug;

  opts.data = objectAssign(opts.data || {}, opts.locals || {});

  return through.obj(function compilePug(file, enc, cb) {
    const data = objectAssign({}, opts.data, file.data || {});

    opts.filename = file.path;
    file.path = ext(file.path, opts.client ? '.js' : '.html');

    if (file.isStream()) {
      return cb(new PluginError('gulp-pug', 'Streaming not supported'));
    }

    if (file.isBuffer()) {
      try {
        let compiled;
        const contents = String(file.contents);
        if (opts.verbose === true) {
          log('compiling file', file.path);
        }
        if (opts.client) {
          compiled = pug.compileClient(contents, opts);
        } else {
          compiled = pug.compile(contents, opts)(data);
        }
        file.contents = new Buffer(compiled);
      } catch (e) {
        return cb(new PluginError('gulp-pug', e));
      }
    }
    cb(null, file);
  });
};
