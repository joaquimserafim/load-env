var test = require('tape');

var load = require('../');


test('load Heroku env', function (t) {
  t.plan(2);

  load('heroku', './test/config');

  t.deepEqual(process.env.MONGODB_URL, 'mongodb://xpto:password@ec2-22-197-555-120.compute-100.amazonaws.com/lilidb?numberOfRetries=10&retryMiliSeconds=10000', 'Your db conn str is ' + process.env.MONGODB_URL);

  t.deepEqual(Number(process.env.APP_PORT), 4000, 'Your web app run @ ' + process.env.APP_PORT);
});


test('load development env', function (t) {
  t.plan(2);

  load('./test/config');

  t.deepEqual(process.env.MONGODB_URL, 'mongodb://xpto:111@localhost/lilidb?numberOfRetries=10&retryMiliSeconds=10000', 'Your db conn str is ' + process.env.MONGODB_URL);

  t.deepEqual(Number(process.env.APP_PORT), 5000, 'Your web app run @ ' + process.env.APP_PORT);
});