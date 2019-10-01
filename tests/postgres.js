const test = require('ava');
const pg = require('../src/database/postgres');

test('Check connection to postgres', async t => {
  try {
    const data = await pg.query('SELECT * FROM users WHERE roles_id = 1');
    t.is(data.rowCount, 1);
    t.is(data.rows[0].roles_id, 1);
  } catch (err) {
    t.log(err);
    t.fail();
  }
})