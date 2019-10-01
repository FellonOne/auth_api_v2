const test = require('ava');
const connectToMongo = require('../src/database/mongoose');

test('Connect to mongo database', async t => {
  try {
    await connectToMongo();
    t.pass();
  } catch (err) {
    t.log(err);
    t.fail();
  }
});