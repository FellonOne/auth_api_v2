const jwt = require('jsonwebtoken');
const config = require('../../config');
const GlobalToken = require('../models/globalToken');
const logger = require('../services/logger');

class Tokens {
  constructor(expiredInAccess = '60m', expiredInRefresh = '7d', globalToken) {
    this.JWT_SECRET = config.JWT_SECRET;
    this.expiredInAccess = expiredInAccess;
    this.expiredInRefresh = expiredInRefresh;
    this.GlobalToken = globalToken;
    this.month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jul', 'Jun', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    this.accessTokemCookieExp = 1000*60*60;
    this.refreshTokenCookieExp = 1000*60*60*24*30;
  }

  async getTokens(user, UID, MODE = 'login') {
    const accessToken = jwt.sign(
      {
        user_id: user.id,
        full_name: user.full_name,
        login: user.login,
        roles_id: user.roles_id,
      },
      this.JWT_SECRET,
      {
        expiresIn: this.expiredInAccess
      }
    );

    const refreshToken = jwt.sign(
      { user_id: user.id, time: Date.now() },
      this.JWT_SECRET,
      {
        expiresIn: this.expiredInRefresh
      }
    );
    
    try { 
      const result = await this.saveRefreshToken(refreshToken, user, UID, MODE);
      if (result === null) throw Error(`Refresh Token (on auth) didn't save on userId = ${user.id}`);

      return {
        accessToken,
        refreshToken,
      }

    } catch (error) {
      logger.log(error);
      return null;
    }
  }

  async saveRefreshToken(refreshToken, user, UID, MODE) {
    try {
      if (MODE === 'login')
        await this.GlobalToken.deleteMany({
          uid: UID,
          user_id: user.id,
        });
      
      const db = new this.GlobalToken({
        refresh_token: refreshToken,
        user_id: user.id,
        full_name: user.full_name,
        roles_id: user.roles_id,
        login: user.login,
        active: true,
        uid: UID,
      });
  
      await db.save();
      return true;
    } catch (err) {
      logger.log(err); return null;
    }
  }

  async updateRefreshToken(refreshToken, UID) {
    try {
      const userData = await this.GlobalToken.find({
        uid: UID,
        active: false,
        refresh_token: refreshToken
      });

      if (userData.length !== 1) { 
        const err = new Error(`Error in updateRefreshToken when tryed find user in db by refresh token (rt = ${refreshToken})`);
        err.status = 401;
        throw err;
      }
      userData.id = userData[0].user_id;

      return this.getTokens({
        full_name: userData[0].full_name,
        id: userData[0].user_id,
        login: userData[0].login,
        roles_id: userData[0].roles_id,
      }, UID, 'refresh');
    } catch (err) {
      logger.log(err); return null;
    }
  }

  setCookies({ accessToken, refreshToken }, ctx) {
    ctx.cookies.set('LAC_AT', accessToken, {
      httpOnly: true,
      maxAge: this.accessTokemCookieExp,
    });
    ctx.cookies.set('LAC_RT', refreshToken, {
      httpOnly: true,
      maxAge: this.refreshTokenCookieExp
    });
    ctx.cookies.set('UID', ctx.state.UID, {
      httpOnly: true,
      maxAge: 1000*60*60*24*365
    });
  }

  getMoth(id) {
    return this.month[id];
  }
}

module.exports = new Tokens('90s', '600s', GlobalToken);

