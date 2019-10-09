const mongoose = require('mongoose');
const config = require('../../config');
const logger = require('../services/logger');

(async () => {
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
  } catch (mogoConnectionError) {
    logger.log(mogoConnectionError);
  }
})();