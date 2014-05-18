var fs = require('fs');
var JSONFile = require('json-tu-file');
var format = require('util').format;
var isJSON = require('is-json');
var chokidar = require('chokidar');
var arrToObject = require('array-to-object');

// HELP FUNCTIONS

// format string from array source
function sprintf (fstr, array) {
  // check the formatted string is for JSON and confirm is a valid JSON
  array.forEach(function (value) {
    fstr = format(fstr, value);
  });
  return fstr;
}

function toArray (obj) {
  return Object.keys(obj).map(function (key) {
    return obj[key];
  });
}

function args () {
  var key;
  var obj =  {};

  process.argv.forEach(function (arg) {
    if (arg.indexOf('--') === 0) {
      key = arg.replace('--', '');
      return;
    }

    if (key) {
      obj[key] = arg;
      key = '';
    }
  });

  return obj;
}


// init Load only onces and don't let call directly
module.exports = function (options) {
  // legacy, maintain 3 args
  if (!isJSON(options, true)) {
    options = arrToObject(['environment', 'path', 'reload'],
                          Array.prototype.slice.call(arguments)) || {};

    // in case passing only the path
    if (options && fs.existsSync(options.environment)) {
      options.path = options.environment;
      options.environment = 'development';
    }
  }
  return new Load(options);
};


// (environment, path, reload)
// {environment: 'environment', path: 'path', reload: true || false}
function Load (options) {
  var self = this;
  self._path = options.path || './config';
  self._environment = options.environment || args().env || 'development';
  self._reload = options.reload || false;

  // reload the env configuration when the current file is updated
  if (self._reload) {
    var file = self._path + '/' + self._environment + '.json';
    self._watcher = chokidar.watch(file, {ignored: /[\/\\]\./, persistent: true});
    self._watcher.on('change', function () {
      self._watcher.close();
      Load.init.call(self);
    });
  }

  // normal load
  Load.init.call(self);
}


Load.init = function () {
  var self = this;
  var configs = {};

  fs.readdirSync(self._path).forEach(function (file) {
    if (self._environment !== file.replace('.json', ''))
      return null;

    var data = JSONFile.readFileSync(self._path + '/' + file);
    if (!data) throw new Error('Uncaught error: check the json structure in config file!');
    configs = data;
  });

  // process.loadenv[key] let returns the primitive value of the specified
  // object for that key
  // %s - String.
  // %d - Number (both integer and float).
  // %j - JSON.
  process.loadenv = {
    __add__: function (key, type, value) {
      this[key] = type === '%d' && !isNaN(value) ? Number(value) :
        type === '%j' && isJSON(value) ? JSON.parse(value) : value ;
    }
  };

  // load values in process.env and into process.loadenv
  Object.keys(configs).forEach(function (k) {
    var val = sprintf(configs[k].format, toArray(configs[k].value));
    process.loadenv.__add__(k, configs[k].format, val);
    process.env[k] = val;
  });
};
