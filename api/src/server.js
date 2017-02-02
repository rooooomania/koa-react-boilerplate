import Koa from 'koa';

const app = new Koa();

app.use(async (ctx, next) => {
  ctx.body = await 'Hello from koajs';
  next();
});

export default app;
