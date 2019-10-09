const test = require('ava');
const agent = require('supertest-koa-agent');
const jwt = require('jsonwebtoken');
const createApp = require('../src/app');
const GlobalToken = require('../src/models/globalToken');

const app = agent(createApp());

test('Update access token by refreshToken', async t => {
  const uid = 'testuid';
  const refreshToken = jwt.sign({}, '12345', {expiresIn: '1d'});
  const tokenDb = new GlobalToken({
    refresh_token: refreshToken,
    user_id: 10,
    full_name: 'test',
    uid,
    roles_id: 2,
    login: 'test@user',
    active: true,
  });

  await tokenDb.save();

  const res = await app.post('/api/v1/global/refresh')
    .send({
      refreshToken
    })
    .set(
      'Cookie', `UID=${uid}`
    );
  
  t.is(res.status, 200);
  t.is(res.body.state, 'success');
  t.true(typeof res.body.body.accessToken === "string");
  t.true(typeof res.body.body.refreshToken === "string");
    
  
});