const jwt = require('jsonwebtoken');
const config = require('../../config');

module.exports = async (ctx, next) => {
  let UID = ctx.cookies.get('UID');
  if (UID === undefined || UID === null || UID === '') {
    UID = jwt.sign(
      {},
      config.JWT_SECRET,
      {
        expiresIn: '999d',
      }
    );
  }
  ctx.state.UID = UID;
  await next();
}