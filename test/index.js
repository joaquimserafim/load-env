var assert = require('assert');
var JSONFile = require('json-tu-file');
var load = require('../');


function development (cb) {
  console.log('# load development env');

  load('./test/config');

  assert.deepEqual(process.env.MONGODB_URL, 'mongodb://xpto:111@localhost/lilidb?numberOfRetries=10&retryMiliSeconds=10000', 'Your db conn str is ' + process.env.MONGODB_URL);

  assert.deepEqual(Number(process.env.APP_PORT), 5000, 'Your web app run @ ' +
    process.env.APP_PORT);

  cb(null, 'development');
}

function heroku (cb) {
  console.log('# load heroku env');

  load('heroku', './test/config');

  assert.deepEqual(process.env.MONGODB_URL, 'mongodb://xpto:password@ec2-22-197-555-120.compute-100.amazonaws.com/lilidb?numberOfRetries=10&retryMiliSeconds=10000', 'Your db conn str is ' + process.env.MONGODB_URL);

  assert.deepEqual(Number(process.env.PORT), 4000, 'Your web app run @ ' +
    process.env.PORT);

  cb(null, 'keroku');
}

function changeFileAndReload (cb) {
   console.log('# load normal env and change the configurations in file and reload the env');


   cb(null, 'changeFileAndReload');
}


[development, heroku, changeFileAndReload].forEach(function (test) {
  test(function (err, t) {
    console.log('# finish ' + t);
    console.log();
  });
});