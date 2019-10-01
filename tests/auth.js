const test = require('ava');
const agent = require('supertest-koa-agent');
const createApp = require('../src/app');

const app = agent(createApp());

test('User can succesfully login', async t => {
  const res = await app.post('/api/v1/auth/login').send({
    login: 'admin@lacore.uz',
    password: '2299c6d375',
  });

  t.is(res.status, 200);
  t.is(res.body.state, 'success')
  t.true(typeof res.body.body.accessToken === "string");
  t.true(typeof res.body.body.refreshToken === "string");
  
  for (let i = 0; i < res.body.fields.length; i += 1)
    t.fail();
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

test.todo('User receives 401 on expired token');