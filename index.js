var fs = require('fs');
var JSONFile = require('json-tu-file');
var format = require('util').format;
var isJSON = require('is-json');


// format string from array source
function sprintf (form, array) {
  array.forEach(function (value) {
    form = isJSON(value, true) ? value : format(form, value);
  });
  return form;
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

// watch the env file if the arg `reload`
// has the value true
function watchFile (env, path, file) {
  fs.watch(file, function (e) {
    // stop watching
    this.close();
    // load new environment
    if (e === 'change') load(env, path, true);
  });
}


module.exports = load;

function load (environment, path, reload) {
  var configs = {};

  // in case of pass only the path
  if (fs.existsSync(environment)) {
    path = environment;
    environment = null;
  }

  path = path || './config';
  environment = environment || args().env || 'development';
  reload = reload || false;


  fs.readdirSync(path).forEach(function (file) {
    if (environment !== file.replace('.json', '')) return;

    var data = JSONFile.readFileSync(path + '/' + file);

    if (!data) throw new Error('Uncaught error: check the json structure in config file');

    // allow reload the config by updating the file
    if (reload) watchFile(environment, path, path + '/' + file);

    configs = data;
  });

  Object.keys(configs).forEach(function (k) {
    var name = k;
    process.env[name] = sprintf(configs[k].format, toArray(configs[k].value));
  });

  return 1;
}
