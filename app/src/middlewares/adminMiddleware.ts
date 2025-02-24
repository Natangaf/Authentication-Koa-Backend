import { Context, Next } from "koa";
import { getCognitoKeys, getUser } from "./authMiddleware";
import jwt from "jsonwebtoken";

const REGION = process.env.REGION;
const USER_POOL_ID = process.env.USER_POOL_ID;
const COGNITO_ISSUER = `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`;

let cachedKeys: Record<string, string> | null = null;

/**
 * Middleware para autorizar somente usuários com a role 'admin'.
 */
export const adminMiddleware = async (ctx: Context, next: Next) => {
  try {
    const { role } = ctx.state.user;

    if (role !== "admin") {
      ctx.status = 403;
      ctx.body = { message: "Acesso negado. Requer permissão de admin." };
      return;
    }

    await next();
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      message: "Erro interno no servidor",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
};

export const crateAdminMiddleware = async (ctx: Context, next: Next) => {
  const authHeader = ctx.headers.authorization;

  ctx.state.user = { email: null, role: null };


  if (!authHeader) {
    return next();
  }

  const token = authHeader?.split(" ")[1];
  if (!token) {
    return next();
  }

  const keys = await getCognitoKeys();
  const decodedHeader = jwt.decode(token, { complete: true });

  if (!decodedHeader || typeof decodedHeader === "string") {
    return next();
  }

  const kid = decodedHeader.header.kid;
  if (!kid || !keys[kid]) {
    return next();
  }

  const pem = keys[kid];

  if (!pem) {
    return next();
  }

  jwt.verify(token, pem, { issuer: COGNITO_ISSUER }, async (err, decoded) => {
    if (err) {
      return next();
    }

    const userId = decoded?.sub;
    if (!userId) {
      return next();
    }
  });

  const user = await getUser(token);

  ctx.state.user = { email: user.email, role: user.role };

  await next();
};
