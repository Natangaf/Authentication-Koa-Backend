import { Context, Next } from 'koa';

export const errorHandler = async (ctx: Context, next: Next) => {
  try {
    await next();
  } catch (err: any) {
    ctx.status = err.status || 500;
    ctx.body = { message: err.message || 'Internal server error' };
    ctx.app.emit('error', err, ctx);
  }
};
