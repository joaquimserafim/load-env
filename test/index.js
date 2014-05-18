var test = require('tape');
var JSONFile = require('json-tu-file');
var load = require('../');
var isJSON = require('is-json');

var conf = {
  dev: {
    0: 'mongodb://xpto:111@localhost/lilidb?numberOfRetries=10&retryMiliSeconds=10000',
    1: 5000,
    2: {width: 1000, height: 600, 'min-width': 800, 'min-height': 600}
  },
  heroku: {
    0: 'mongodb://xpto:password@ec2-22-197-555-120.compute-100.' +
    'amazonaws.com/lilidb?numberOfRetries=10&retryMiliSeconds=10000',
    1: 4000
  },
  reload: {
    0:  'mongodb://test:test@localhost/test'
  }
};


var json = {
  "WINDOW_SIZE": {
    "format": "%j",
    "value": {
      "sizes": {
        "width": 1000,
        "height": 600,
        "min-width": 800,
        "min-height": 600
      }
    }
  }
};


// test 1
test('#development', function (t) {
  t.plan(3);
  load('./test/config');

  t.deepEqual(process.env.MONGODB_URL,
              conf.dev[0],
              'mongoDB string conn should be equal');

  t.deepEqual(Number(process.env.APP_PORT),
              conf.dev[1],
              'ports numbers should be equal');

  t.deepEqual(process.env.WINDOW_SIZE,
              JSON.stringify(conf.dev[2]),
              'JSON objects should be equal');
});

// test 2
test('#heroku', function (t) {
  t.plan(2);
  load('heroku', './test/config');

  t.deepEqual(process.env.MONGODB_URL,
             conf.heroku[0],
             'mongoDB string conn should be equal');

  t.deepEqual(Number(process.env.APP_PORT),
             conf.heroku[1],
             'ports numbers should be equal');
});


// test 3
test('#using process.loadenv to load the primitive value of the specified object', function (t) {
  t.plan(3);
  load('development', './test/config');

  t.deepEqual(typeof process.loadenv.MONGODB_URL, 'string', 'should be a string');
  t.deepEqual(typeof process.loadenv.APP_PORT, 'number', 'should be a number');
  t.deepEqual(isJSON(process.loadenv.WINDOW_SIZE, true), true, 'should be a JSON');
});

// test 4
test('#updated&reload', function (t) {
  t.plan(1);
  load('development', './test/config', true);

  var new_config = {
    MONGODB_URL: {
      format: 'mongodb://%s:%s@%s/%s',
      value: {
        user: 'test',
        pwd: 'test',
        host: 'localhost',
        db: 'test'
      }
    }
  };

  // put some timeout
  setTimeout(function () {
    // write new configuration
    JSONFile.writeFileSync(new_config,
                           './test/config/development.json',
                           {encoding: 'ascii'});

    setTimeout(function () {
      t.deepEqual(process.env.MONGODB_URL,
                  conf.reload[0],
                  'mongoDB should have the new conn string');
      setTimeout(function () {process.exit(0);}, 200);
    }, 200);
  }, 200);
});
