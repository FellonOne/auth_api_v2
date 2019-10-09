const test = require('ava');
const mongoose = require('mongoose');
const config = require('../config');

test('Connect to mongo database', async t => {
  try {
    await mongoose.connect(
      config.APP_PC === 'true' ? 
      `mongodb://${config.DB_MONGO_HOST}/${config.DB_MONGO_BASE}?userAdmin=true`
      :
      `mongodb://${config.DB_MONGO_USER}:${config.DB_MONGO_PASSWORD}@${config.DB_MONGO_HOST}/${config.DB_MONGO_BASE}?userAdmin=true`
    , {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    t.pass();
  } catch (err) {
    t.log(err);
    t.fail();
  }
});