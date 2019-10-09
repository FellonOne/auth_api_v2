const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const userService = require('../services/users');
const tokenService = require('../services/tokens');

const router = new Router();

router.post('/login', bodyParser(), async ctx => {
  const { login, password } = ctx.request.body;
  if (!login || !password) {
    ctx.status = 200;

    const fields = []; 
    if (!login) fields.push('login');
    if (!password) fields.push('password');

    ctx.body = {
      state: 'error',
      fields,
      body: {}
    }
  } else {
    const userDB = await userService.findByLogin(login);
    const passwordCompare = await userService.comparePassword((userDB !== null) ? userDB.password : '', password);

    if (userDB === null || !passwordCompare) {
      ctx.status = 403;
      ctx.body = {
        state: 'error',
        fields: [
          'login',
          'password'
        ],
        body: {}
      }
    } else {
      const tokens = await tokenService.getTokens(userDB, ctx.state.UID);
      if (tokens === null) { const error = Error(`Tokens didn't get on user = ${userDB.id}`); error.status = 404; throw error; }
      ctx.status = 200;
      ctx.body = {
        state: 'success',
        body: tokens,
        fields: []
      }
    }
  }
});

router.post('/logout', async ctx => {
  //
});

module.exports = router;