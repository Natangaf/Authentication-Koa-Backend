import { Context, Next } from "koa";
import jwt from "jsonwebtoken";
import jwkToPem from "jwk-to-pem";
import {
  CognitoIdentityProviderClient,
  GetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import axios from "axios";
import { UserService } from "../services/UserService";

const REGION = process.env.REGION;
const USER_POOL_ID = process.env.USER_POOL_ID;
const COGNITO_ISSUER = `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`;
const cognitoClient = new CognitoIdentityProviderClient({ region: REGION });

let cachedKeys: Record<string, string> | null = null;

const userService = new UserService();

/**
 * Obtém as chaves públicas do Cognito para validar o JWT.
 * As chaves são armazenadas em cache para evitar requisições repetidas.
 * @returns Um objeto com as chaves públicas do Cognito.
 */
export const getCognitoKeys = async (): Promise<Record<string, string>> => {
  if (cachedKeys) {
    return cachedKeys;
  }

  const { data } = await axios.get(`${COGNITO_ISSUER}/.well-known/jwks.json`);
  const keys = data.keys.reduce((acc: Record<string, string>, key: any) => {
    acc[key.kid] = jwkToPem(key);
    return acc;
  }, {});

  cachedKeys = keys;
  return keys;
};

/**
 * Obtém as informações do usuário a partir do token de acesso no Cognito.
 * Utiliza o comando GetUser do AWS SDK para buscar o usuário com base no AccessToken.
 * @param accessToken O token de acesso do usuário.
 * @returns Um objeto com o email e cargo (role) do usuário.
 * @throws Error se o usuário ou as informações não forem encontradas.
 */
export const getUser = async (accessToken: string) => {
  try {
    const command = new GetUserCommand({
      AccessToken: accessToken,
    });

    const response = await cognitoClient.send(command);

    const emailAttribute = response.UserAttributes?.find(
      (attr) => attr.Name === "email"
    );

    if (!emailAttribute || !emailAttribute.Value) {
      throw new Error("Email não encontrado");
    }

    const user = await userService.findByEmail(emailAttribute.Value);

    if (!user) {
      throw new Error("Email não encontrado");
    }

    return {
      email: emailAttribute.Value,
      role: user.role,
    };
  } catch (error) {
    throw new Error("Failed to fetch email from Cognito");
  }
};

/**
 * Middleware de autenticação que verifica a validade do JWT com base nas chaves públicas do Cognito.
 * Esse middleware verifica se o token de autorização é válido e se o usuário tem permissão para acessar os recursos.
 * @param ctx O contexto da requisição, incluindo o cabeçalho de autorização.
 * @param next Função que chama o próximo middleware, se a autenticação for bem-sucedida.
 * @throws Retorna erro 401 caso o token seja inválido ou qualquer outro erro.
 */
export const authMiddleware = async (ctx: Context, next: Next) => {
  try {
    const authHeader = ctx.headers.authorization;

    if (!authHeader) {
      ctx.status = 401;
      ctx.body = { message: "Authorization header is missing" };
      return;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      ctx.status = 401;
      ctx.body = { message: "Invalid authorization header format" };
      return;
    }

    const keys = await getCognitoKeys();
    const decodedHeader = jwt.decode(token, { complete: true });

    if (!decodedHeader || typeof decodedHeader === "string") {
      ctx.status = 401;
      ctx.body = { message: "Invalid token" };
      return;
    }

    const kid = decodedHeader.header.kid;
    if (!kid || !keys[kid]) {
      ctx.status = 401;
      ctx.body = { message: "Invalid token kid" };
      return;
    }

    const pem = keys[kid];

    if (!pem) {
      ctx.status = 401;
      ctx.body = { message: "Invalid token kid" };
      return;
    }

    jwt.verify(token, pem, { issuer: COGNITO_ISSUER }, async (err, decoded) => {
      if (err) {
        ctx.status = 401;
        ctx.body = { message: "Token verification failed", error: err.message };
        return;
      }

      const userId = decoded?.sub;
      if (!userId) {
        ctx.status = 401;
        ctx.body = { message: "User ID not found in token" };
        return;
      }
    });

    const user = await getUser(token);

    ctx.state.user = { email: user.email, role: user.role };

    await next();
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
