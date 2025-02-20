const Koa = require("koa");
const Router = require("@koa/router");
const bodyParser = require("koa-bodyparser");

const app = new Koa();
const router = new Router();

app.use(bodyParser());

// Rota GET de exemplo
router.get("/", (ctx) => {
  ctx.body = { message: "Bem-vindo ao Koa.js!" };
});

// Rota POST de exemplo
router.post("/dados", (ctx) => {
  const body = ctx.request.body;
  ctx.body = { receivedData: body };
});

// Aplicar as rotas
app.use(router.routes());
app.use(router.allowedMethods());

// Iniciar o servidor
const port = 3000;
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
