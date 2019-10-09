const test = require('ava');
const agent = require('supertest-koa-agent');
const createApp = require('../src/app');
const GlobalToken = require('../src/models/globalToken');

const app = agent(createApp());

test('User can succesfully login and refresh token exist in db (no more one time)', async t => {
  const res = await app.post('/api/v1/auth/login').send({
    login: 'admin@lacore.uz',
    password: '2299c6d375',
  })
  .set('Cookie', 'UID=12345');

  t.is(res.status, 200);
  t.is(res.body.state, 'success');
  t.true(typeof res.body.body.accessToken === "string");
  t.true(typeof res.body.body.refreshToken === "string");
  
  for (let i = 0; i < res.body.fields.length; i += 1)
    t.fail();

  const data = await GlobalToken.find({ refresh_token: res.body.body.refreshToken });
  t.is(data.length, 1);
  t.is(data[0].login, 'admin@lacore.uz');

  const secondRes = await app.post('/api/v1/auth/login').send({
    login: 'admin@lacore.uz',
    password: '2299c6d375',
  })
  .set('Cookie', 'UID=12345');

  t.is(secondRes.status, 200);
  t.is(secondRes.body.state, 'success');
  t.true(typeof secondRes.body.body.accessToken === "string");
  t.true(typeof secondRes.body.body.refreshToken === "string");
  
  for (let i = 0; i < secondRes.body.fields.length; i += 1)
    t.fail();

  const uniqueField = await GlobalToken.find({ uid: 12345, user_id: data[0].user_id});
  t.is(uniqueField.length, 1)
});

test('User get 403 on invalid login', async t => {
  const res = await app.post('/api/v1/auth/login').send({
    login: 'INCORRECT',
    password: 'nevermind',
  });

  t.is(res.status, 403);
  t.is(res.body.state, 'error');

  let count = 0;
  for (let i = 0; i < res.body.fields.length; i += 1) {
    count += 1;
    t.true(i < 2);
  }
  t.is(count, 2);
});

test('User get 403 on invalid password', async t => {
  const res = await app.post('/api/v1/auth/login').send({
    login: 'admin@lacore.uz',
    password: 'nevermind',
  });

  t.is(res.status, 403);
  t.is(res.body.state, 'error');

  let count = 0;
  for (let i = 0; i < res.body.fields.length; i += 1) {
    count += 1;
    t.true(i < 2);
  }
  t.is(count, 2);
});

test('User try login without once credential parametr (password)', async t => {
  const res = await app.post('/api/v1/auth/login').send({
    login: 'nevermind',
  });

  t.is(res.status, 200);
  t.is(res.body.state, 'error');
  t.is(res.body.fields[0], 'password');

  let count = 0;
  for (let i = 0; i < res.body.fields.length; i += 1) {
    count += 1;
    t.true(i < 1);
  }
  t.is(count, 1);
});

test('User try login without once credential parametr (login)', async t => {
  const res = await app.post('/api/v1/auth/login').send({
    password: 'nevermind',
  });

  t.is(res.status, 200);
  t.is(res.body.state, 'error');
  t.is(res.body.fields[0], 'login');

  let count = 0;
  for (let i = 0; i < res.body.fields.length; i += 1) {
    count += 1;
    t.true(i < 1);
  }
  t.is(count, 1);
});