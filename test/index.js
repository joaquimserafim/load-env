var assert = require('assert');
var JSONFile = require('json-tu-file');
var load = require('../');


function development (cb) {
  console.log('#load development env');

  load('./test/config');

  assert.deepEqual(process.env.MONGODB_URL,
                   'mongodb://xpto:111@localhost/lilidb?numberO' +
                   'fRetries=10&retryMiliSeconds=10000',
                   'Your db conn str is ' + process.env.MONGODB_URL);

  assert.deepEqual(Number(process.env.APP_PORT), 5000, 'Your web app run @ ' +
    process.env.APP_PORT);

  cb(null, 'development');
}

function heroku (cb) {
  console.log('#load heroku env');

  load('heroku', './test/config');

  assert.deepEqual(process.env.MONGODB_URL,
                   'mongodb://xpto:password@ec2-22-197-555-120.compute-100.' +
                   'amazonaws.com/lilidb?numberOfRetries=10&retryMiliSeconds=10000',
                   'Your db conn str is ' + process.env.MONGODB_URL);

  assert.deepEqual(Number(process.env.PORT), 4000, 'Your web app run @ ' +
    process.env.PORT);

  cb(null, 'keroku');
}

function changeFileAndReload (cb) {
  console.log('#load normal env and change the configs in file and reload the env');

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

  setTimeout(function () {
    JSONFile.writeFileSync(new_config,
                           './test/config/development.json',
                           {encoding: 'ascii'});

    setTimeout(function () {
      assert.deepEqual(process.env.MONGODB_URL,
                       'mongodb://test:test@localhost/test',
                       'Your db conn str is ' + process.env.MONGODB_URL);

      cb(null, 'changeFileAndReload');
      // must call exit fs.watch will be watch for changes in a file
      process.exit(0);
    }, 500);

  }, 500);
}

// run flow
[development, heroku].forEach(function (test) {
  test(function (err, t) {
    console.log('# finish ' + t);
    console.log();
  });
});
