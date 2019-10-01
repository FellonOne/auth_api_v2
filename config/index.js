const rc = require('rc');
const dotenv = require('dotenv');
const { resolve } = require('path');

dotenv.config({ path: resolve(__dirname, '..', '.env') });

module.exports = rc('LacoreAuthApi', {
  PORT: process.env.PORT || 3000,
  DB_MONGO_USER: process.env.DB_MONGO_USER,
  DB_MONGO_PASSWORD: process.env.DB_MONGO_PASSWORD,
  PG_ADDRESS: process.env.PG_ADDRESS,
  PG_PORT: process.env.PG_PORT,
  PG_LOGIN: process.env.PG_LOGIN,
  PG_PASSWORD: process.env.PG_PASSWORD,
  PG_DB: process.env.PG_DB,
  APP_DEBUG: process.env.APP_DEBUG,
  APP_PC: process.env.APP_PC,
  JWT_SECRET: process.env.JWT_SECRET,
  DB_MONGO_HOST: process.env.DB_MONGO_HOST,
  DB_MONGO_BASE: process.env.DB_MONGO_BASE,
  AUTH_STATIC_URL: process.env.AUTH_STATIC_URL,
  SSO_ACTIVATE: process.env.SSO_ACTIVATE ? process.env.SSO_ACTIVATE : '12345',
  BEARER_SECRET: process.env.BEARER_SECRET ? process.env.BEARER_SECRET : 12345
});
