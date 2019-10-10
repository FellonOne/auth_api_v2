const test = require('ava');
const agent = require('supertest-koa-agent');
const jwt = require('jsonwebtoken');
const createApp = require('../src/app');
const GlobalToken = require('../src/models/globalToken');

const app = agent(createApp());

test('Update access token by refreshToken on /global/refresh', async t => {
  const uid = `${parseInt(Math.random()*10000, 10)}_uid`;
  const refreshToken = jwt.sign({user_id: 10}, '12345', {expiresIn: '1d'});

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

  const res = await app.get('/api/v1/global/refresh')
    .set(
      'Cookie', `UID=${uid};LAC_RT=${refreshToken}`
    );
  

  t.is(res.status, 200);
  t.is(res.body.state, 'success');
  t.true(typeof res.body.body.full_name === "string");
  t.true(typeof res.body.body.login === "string");
  t.true(typeof parseInt(res.body.body.user_id, 10) === "number");
  t.true(typeof parseInt(res.body.body.roles_id, 10) === "number");

  t.is(res.body.body.user_id, 10);
  t.is(res.body.body.login, 'test@user');
  t.is(res.body.body.full_name, 'test');
  t.is(res.body.body.roles_id, 2);
});

test('Get 404 with expired refresh token on /global/refresh', async t => {
  const uid = `${parseInt(Math.random()*10000, 10)}_uid`;
  const deadToken = jwt.sign({user_id:322}, '12345', {expiresIn: '1ms'});

  const res = await app.get('/api/v1/global/refresh')
    .set(
      'Cookie', `UID=${uid};LAC_RT=${deadToken}`
    );

  t.is(res.status, 404);
  t.is(res.body.state, 'error');
});

test('Get 404 with invalid refresh token on /global/refresh', async t => {
  const uid = `${parseInt(Math.random()*10000, 10)}_uid`;
  const refreshToken = 'invalidToken';

  const res = await app.get('/api/v1/global/refresh')
    .set(
      'Cookie', `UID=${uid};LAC_RT=${refreshToken}`
    );

  t.is(res.status, 404);
  t.is(res.body.state, 'error');
});

test('Get 404 with empty body on /global/refresh', async t => {
  const uid = `${parseInt(Math.random()*10000, 10)}_uid`;

  const res = await app.get('/api/v1/global/refresh')
    .set(
      'Cookie', `UID=${uid};LAC_RT=`
    );

  t.is(res.status, 404);
});

test('404 and error on activate used refresh token on /global/refrseh', async t => {
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

  const res = await app.get('/api/v1/global/refresh')
    .set(
      'Cookie', `UID=${uid};LAC_RT=${refreshToken}`
    );

  t.is(res.status, 200);
  t.is(res.body.state, 'success');
  t.true(typeof res.body.body.full_name === "string");
  t.true(typeof res.body.body.login === "string");
  t.true(typeof parseInt(res.body.body.user_id, 10) === "number");
  t.true(typeof parseInt(res.body.body.roles_id, 10) === "number");

  t.is(res.body.body.user_id, 20);
  t.is(res.body.body.login, 'test2@user');
  t.is(res.body.body.full_name, 'test2');
  t.is(res.body.body.roles_id, 2);
  
  const secondRes = await app.get('/api/v1/global/refresh')
    .set(
      'Cookie', `UID=${uid};LAC_RT=${res.headers['set-cookie'][1].split(';')[0].split('=')[1]}`
    )
  
  t.is(secondRes.status, 200);
  t.is(secondRes.body.state, 'success');
  t.true(typeof secondRes.body.body.full_name === "string");
  t.true(typeof secondRes.body.body.login === "string");
  t.true(typeof parseInt(secondRes.body.body.user_id, 10) === "number");
  t.true(typeof parseInt(secondRes.body.body.roles_id, 10) === "number");

  t.is(secondRes.body.body.user_id, 20);
  t.is(secondRes.body.body.login, 'test2@user');
  t.is(secondRes.body.body.full_name, 'test2');
  t.is(secondRes.body.body.roles_id, 2);
  
  
  const usedRefreshToken = await app.get('/api/v1/global/refresh')
    .set(
      'Cookie', `UID=${uid};LAC_RT=${refreshToken}`
    );

  t.is(usedRefreshToken.status, 404);
  t.is(usedRefreshToken.body.state, 'error');

  const countRecords = await GlobalToken.find({ user_id: 20, uid });
  t.is(countRecords.length, 0)
});