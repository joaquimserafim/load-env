var fs = require('fs');
var JSONFile = require('json-tu-file');
var format = require('util').format;
var isJSON = require('is-json');
var chokidar = require('chokidar');
var arrToObject = require('array-to-object');


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
  this._options = {
    path: options.path || './config',
    environment: options.environment || args().env || 'development',
    reload: options.reload || false
  };

  this.init();
}

Load.prototype.init = function () {
  var self = this;
  var configs = {};

  fs.readdirSync(self._options.path).forEach(function (file) {
    if (self._options.environment !== file.replace('.json', ''))
      return null;

    var data = JSONFile.readFileSync(self._options.path + '/' + file);
    if (!data) throw new Error('Uncaught error: check the json structure in config file!');
     configs = data;
  });

  Object.keys(configs).forEach(function (k) {
    process.env[k] = sprintf(configs[k].format, toArray(configs[k].value));
  });

  // allow to reload the env configuration when the current file is updated
  if (self._options.reload) {
    var file = this._options.path + '/' + this._options.environment + '.json';
    self._watcher = chokidar.watch(file, {ignored: /[\/\\]\./, persistent: true});
    self._watcher.on('change', function () {
      self._watcher.close();
       self.init();
    });
  }
};

