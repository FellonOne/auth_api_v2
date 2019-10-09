const bcrypt = require('bcryptjs');
const pg = require('../database/postgres');
const logger = require('./logger');

class Users {
  constructor(pgPool, bcryptjs) {
    this.pg = pgPool;
    this.bcrypt = bcryptjs;
  }

  async findByLogin(userLogin) {
    try {
      const result = await this.pg.query(
        'SELECT id, full_name, roles_id, login, password FROM users WHERE login = $1',
        [userLogin]
      );
      return (result.rowCount > 0) ? result.rows[0] : null;
    } catch (pgError) {
      logger.log(pgError); return null;
    }
  }

  async findById(userId) {
    try { 
      const result = await this.pg.query(
        'SELECT id, full_name, roles_id, login, password FROM users WHERE id = $1',
        [userId]
      );
      return (result.rowCount > 0) ? result.rows[0] : null;
    } catch (pgError) {
      logger.log(pgError); return null;
    }
  }
  
  async comparePassword(userPassword, inputPassword) {
    return this.bcrypt.compare(inputPassword.trim(), userPassword.replace('$2y$', '$2a$'));
  }
}


module.exports = new Users(pg, bcrypt);