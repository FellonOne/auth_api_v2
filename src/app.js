const Koa = require('koa');
const Router = require('koa-router');
const helmet = require('koa-helmet');
const authRouter = require('./controllers/auth');
const refreshRouter = require('./controllers/refresh');
const uid = require('./middleware/uid');
require('./database/mongoose');

const config = require('../config');

const registerName = [
	'http://localhost:8080'
]
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
	app.use(helmet());
	app.use( async (ctx, next) => {
		const reqOrigin = ctx.header.origin;
		registerName.forEach(origin => {
			if (origin === reqOrigin) ctx.set("Access-Control-Allow-Origin", reqOrigin);
		});
		ctx.set("Access-Control-Allow-Methods", "GET, POST");
		ctx.set("Access-Control-Allow-Credentials", true);
		ctx.set("Access-Control-Allow-Headers", [
			'Origin', 'Content-Type', 'Accept', 'Authorization', 'Access-token', 'Refresh-token'
		]);
		ctx.set("X-Powered-By", "PHP 4.2.0");
		ctx.set("X-XSS-Protection", "1; mode=block; report=/report-xss-violation");
		await next();
	});
  app.use(uid);
  /*
        Connect all routes
    */
  router.use('/api/v1/auth', authRouter.routes());
  router.use('/api/v1/global', refreshRouter.routes());

  app.use(router.allowedMethods());
  app.use(router.routes());
  return app;
}

if (!module.parent) {
  createApp().listen(config.PORT, '0.0.0.0');
  global.console.log(`Server started. Listen 0.0.0.0:${config.PORT}`);
}

module.exports = createApp;
