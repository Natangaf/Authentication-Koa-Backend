import { Context, Next } from 'koa';

/**
 * Middleware para autorizar somente usuários com a role 'admin'.
 */
export const adminMiddleware = async(ctx: Context, next: Next) =>{
    try {
        const { role } = ctx.state.user;

        if (role !== 'admin') {
            ctx.status = 403;
            ctx.body = { message: 'Acesso negado. Requer permissão de admin.' };
            return;
        }

        await next();

    } catch (error) {
        ctx.status = 500;
        ctx.body = {
            message: 'Erro interno no servidor',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        };
    }
}
