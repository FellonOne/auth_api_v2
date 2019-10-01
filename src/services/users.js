const bcrypt = require('bcryptjs');
const pg = require('../database/postgres');

class Users {
  constructor(pgPool, bcryptjs) {
    this.pg = pgPool;
    this.bcrypt = bcryptjs;
  }

  async findByLogin(userLogin) {
    const result = await this.pg.query(
      'SELECT id, full_name, roles_id, login, password FROM users WHERE login = $1',
      [userLogin]
    );

    if (result.rowCount === 0)
      return null;
    return result.rows[0];
  }
  
  async comparePassword(userPassword, inputPassword) {
    return this.bcrypt.compare(inputPassword.trim(), userPassword.replace('$2y$', '$2a$'));
  }
}


module.exports = new Users(pg, bcrypt);