const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const jwt = require('jsonwebtoken');
const config = require('../../config');
const userService = require('../services/users');
const tokenService = require('../services/tokens');

const router = new Router();

// LOGIN USER
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

      tokenService.setCookies(tokens, ctx);

      ctx.status = 200;
      ctx.body = {
        state: 'success',
        body: {
          full_name: userDB.full_name,
          user_id: userDB.id,
          roles_id: userDB.roles_id,
          login: userDB.login,
        },
        fields: []
      }
    }
  }
});

// VALIDATE AT
router.get('/validate', bodyParser(), async ctx => {
  const accessToken  = ctx.cookies.get('LAC_AT');

  try {
    const user = jwt.verify(accessToken, config.JWT_SECRET);

    ctx.state = 200;
    ctx.body = {
      state: 'success',
      message: 'token valid',
      body: {
        login: user.login,
        full_name: user.full_name,
        roles_id: user.roles_id,
        user_id: user.user_id
      }
    }
  } catch ( jwtEpiredError ) {
    if (jwtEpiredError.name === jwt.TokenExpiredError.name) {
      ctx.status = 401;
      ctx.body = {
        state: 'error',
        message: 'token expired',
      }
    } else {
      ctx.status = 404;
      ctx.body = {
        state: 'not-founded',
      }
    }
  }
});

// LOGOUT USER
// router.post('/logout', async ctx => {
//   //
// });

module.exports = router;