import Koa from 'koa';
import bodyParser from 'koa-body';
import userRoutes from './routes/userRoutes';
import { errorHandler } from './middlewares/errorHandler';

const app = new Koa();

app.use(bodyParser());
app.use(errorHandler);
app.use(userRoutes.routes());
app.use(userRoutes.allowedMethods());

export default app;
