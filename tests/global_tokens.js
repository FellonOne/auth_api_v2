const test = require('ava');
const agent = require('supertest-koa-agent');
const jwt = require('jsonwebtoken');
const createApp = require('../src/app');
const GlobalToken = require('../src/models/globalToken');

const app = agent(createApp());

test('Update access token by refreshToken on /global/refresh', async t => {
  const uid = `${parseInt(Math.random()*10000, 10)}_uid`;
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

test('Get 401 with expired refresh token on /global/refresh', async t => {
  const uid = `${parseInt(Math.random()*10000, 10)}_uid`;
  const deadToken = jwt.sign({}, '12345', {expiresIn: '1ms'});

  const res = await app.post('/api/v1/global/refresh')
    .send({
      refreshToken: deadToken,
    })
    .set(
      'Cookie', `UID=${uid}`
    );

  t.is(res.status, 401);
  t.is(res.body.state, 'error');
});

test('Get 401 with invalid refresh token on /global/refresh', async t => {
  const uid = `${parseInt(Math.random()*10000, 10)}_uid`;
  const refreshToken = 'invalidToken';

  const res = await app.post('/api/v1/global/refresh')
    .send({
      refreshToken
    })
    .set(
      'Cookie', `UID=${uid}`
    );

  t.is(res.status, 401);
  t.is(res.body.state, 'error');
});

test('Get 404 with empty body on /global/refresh', async t => {
  const uid = `${parseInt(Math.random()*10000, 10)}_uid`;

  const res = await app.post('/api/v1/global/refresh')
    .set(
      'Cookie', `UID=${uid}`
    );

  t.is(res.status, 404);
});

test('401 and error on activate used refresh token on /global/refrseh', async t => {
  const uid = `${parseInt(Math.random()*10000, 10)}_2uid`;
  const refreshToken = jwt.sign({user_id: 20}, '12345', {expiresIn: '2d'});

  const tokenDb = new GlobalToken({
    refresh_token: refreshToken,
    user_id: 20,
    full_name: 'test2',
    uid,
    roles_id: 2,
    login: 'test2@user',
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

  const secondRes = await app.post('/api/v1/global/refresh')
    .send({
      refreshToken: res.body.body.refreshToken
    })
    .set(
      'Cookie', `UID=${uid}`
    );
  
  t.is(secondRes.status, 200);
  t.is(secondRes.body.state, 'success');
  t.true(typeof secondRes.body.body.accessToken === "string");
  t.true(typeof secondRes.body.body.refreshToken === "string"); 
  
  
  const usedRefreshToken = await app.post('/api/v1/global/refresh')
    .send({
      refreshToken
    })
    .set(
      'Cookie', `UID=${uid}`
    );

  t.is(usedRefreshToken.status, 401);
  t.is(usedRefreshToken.body.state, 'error');

  const countRecords = await GlobalToken.find({ user_id: 20, uid });
  t.is(countRecords.length, 0)
});