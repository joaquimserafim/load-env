var fs = require('fs');
var JSONFile = require('json-tu-file');
var Format = require('util').format;


// format string from array source
function sprintf (format, array) {
  array.forEach(function cb_each (value) {
    format = Format(format, value);
  });
  return format;
}

function toArray (obj) {
  return Object.keys(obj).map(function cb_each_keys (key) {
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
  

module.exports = load;

function load (environment, path) {
  var configs = {};

  // in case of pass only the path
  if (fs.existsSync(environment)) {
    path = environment;
    environment = null;
  }
  
  path = path || './config';
  environment = environment || args().env || 'development';

  var files = fs.readdirSync(path);

  files.forEach(function cb_each (file) {
    if (file.indexOf(environment) === -1) return;

    var data = JSONFile.readFileSync(path + '/' + file);
    
    if (!data) throw new Error('Uncaught error: check the json structure in config file');

    configs = data;
  });

  for (var k in configs) {
    var name = configs[k].name;
    process.env[name] = sprintf(configs[k].format, toArray(configs[k].value));
  }
  
  return 1;
}