const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const jwt = require('jsonwebtoken');

const globalToken = require('../models/globalToken');
const config = require('../../config');
const tokenService = require('../services/tokens');
const logger = require('../services/logger');

const router = new Router();

router.get('/refresh', bodyParser(), async ctx => {
  const refreshToken = ctx.cookies.get('LAC_RT');

  if (refreshToken === null || refreshToken === undefined || refreshToken === '') {
    const err = new Error(`Empty body for /global/refresh`); 
    err.status = 404; throw err;
  }

  try {
    jwt.verify(refreshToken, config.JWT_SECRET);
    /*
      Security check. If token activated some times ago and user try use old rt => delete all rt on by user_id
    */
    const activatedResfreshToken = await globalToken.find({
      refresh_token: refreshToken
    });

    if (activatedResfreshToken.length === 0) {
       const err = new Error(`Refresh token doesn't exist in MongoDB (UID = ${ctx.state.UID})`);
       err.status = 404; throw err;
    }

    if (activatedResfreshToken[0].active === false) {
      await globalToken.deleteMany({
        user_id: activatedResfreshToken[0].user_id
      });
      const err = new Error(`SECURITY ERROR!\nFOR userID = ${activatedResfreshToken[0].user_id}; Try used disactivated RT`);
      err.status = 404; throw err;
    }
    /** End Security check block */

    await globalToken.updateMany(
      {
        uid: ctx.state.UID
      },
      { '$set': { active: false } }
    ); 
    

    const newTokens = await tokenService.updateRefreshToken(refreshToken, ctx.state.UID);
    if (newTokens === null) {
      const err = new Error(`Cannot update jwt (in class method); rt = ${refreshToken}`); err.status = 404; throw err;
    }

    tokenService.setCookies(newTokens, ctx);

    ctx.status = 200;
    ctx.body = {
      state: 'success',
      body: {
        login: activatedResfreshToken[0].login,
        full_name: activatedResfreshToken[0].full_name,
        user_id: activatedResfreshToken[0].user_id,
        roles_id: activatedResfreshToken[0].roles_id
      },
      fields: []
    }

  } catch (jwtVerifyError) {
    logger.log(jwtVerifyError);
    ctx.status = 404;
    ctx.body = {
      state: 'error',
      message: 'token expired'
    };
  }
});

module.exports = router;
