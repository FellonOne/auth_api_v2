const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const userService = require('../services/users');

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
      ctx.status = 200;
      ctx.body = {
        state: 'success',
        body: {
          accessToken: 'accessToken',
          refreshToken: 'refreshToken',
        },
        fields: []
      }
    }

    
  }
});

module.exports = router;