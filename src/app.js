const Koa = require('koa');
const Router = require('koa-router');
const authRouter = require('./controllers/auth');
const ssoRouter = require('./controllers/sso');
const uid = require('./middleware/uid');
const mongoose = require('./database/mongoose');

const config = require('../config');

/**
 * Return configure Koa server ready to start 
 * @returns Koa app object
 */
function createApp() {
    const app = new Koa();
    const router = new Router();
    /*
        Middlewares
    */
    app.use(uid);
    /*
        Connect all routes
    */
    router.use('/api/v1/auth', authRouter.routes());
    router.use('/api/v1/global', ssoRouter.routes());

    app.use(router.allowedMethods());
    app.use(router.routes());
    return app;
}

if (!module.parent) {
    createApp().listen(config.PORT, '0.0.0.0');
    global.console.log(`Server started. Listen 0.0.0.0:${config.PORT}`);
}

module.exports = createApp;