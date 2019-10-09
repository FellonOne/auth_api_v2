const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const jwt = require('jsonwebtoken');

const globalToken = require('../models/globalToken');
const config = require('../../config');
const tokenService = require('../services/tokens');
const logger = require('../services/logger');

const router = new Router();

router.post('/refresh', bodyParser(), async ctx => {
  const { refreshToken } = ctx.request.body;
  try {
    jwt.verify(refreshToken, config.JWT_SECRET);

    await globalToken.updateMany(
      {
        uid: ctx.state.UID
      },
      { active: false }
    );

    const newTokens = await tokenService.updateRefreshToken(refreshToken, ctx.state.UID);
    if (newTokens === null) { 
      const err = Error(`Cannot update jwt (in class method); rt = ${refreshToken}`); throw err;
    }
    
    ctx.status = 200;
    ctx.body = {
      state: 'success',
      body: newTokens,
      fields: []
    }

  } catch (jwtVerifyError) {
    logger.log(jwtVerifyError);
    ctx.status = 401;
    ctx.body = {
      state: 'error',
      message: 'token expired'
    };
  }
});

module.exports = router;
