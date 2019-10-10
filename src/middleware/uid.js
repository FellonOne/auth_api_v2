const jwt = require('jsonwebtoken');
const config = require('../../config');

module.exports = async (ctx, next) => {
  let UID = ctx.cookies.get('UID');
  if (UID === undefined || UID === null || UID === '') {
    UID = jwt.sign(
      { 
        unique_id: parseInt(Math.random()*100000, 10),
        time: Date.now(),
      },
      config.JWT_SECRET,
      {
        expiresIn: '999d',
      }
    );
  }
  ctx.state.UID = UID;
  if (config.AVA_TEST !== 'true') {
    ctx.cookies.set('UID', UID, { 
      httpOnly: true,
      path: '/',
      maxAge: (1000*60*60*24*365),
    });
  }
  await next();
}