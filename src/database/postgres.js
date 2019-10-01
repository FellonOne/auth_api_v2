const { Pool } = require('pg');
const config = require('../../config');

class Postgres {
  constructor(poolConfig) {
    this.pool = new Pool(poolConfig);
  }

  async query(string, params) {
    return this.pool.query(string, params);
  }

  async close() {
    this.client.release();
  }
}

const poolConfig = {
  user: config.PG_LOGIN,
  password: config.PG_PASSWORD,
  host: config.PG_HOST,
  database: config.PG_DB,
  port: config.PG_PORT
};

module.exports = new Postgres(poolConfig);