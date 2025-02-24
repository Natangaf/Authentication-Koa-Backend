import { Context } from "koa";
import { UserService } from "../services/UserService";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";

const userService = new UserService();

export class UserController {
  /**
   * Autentica um usuário com email e senha.
   * Se o usuário não existir, cria um novo usuário e retorna os dados junto com o token.
   * Se o usuário já existir, retorna os dados do usuário junto com o token de autenticação.
   */
  static async authUser(ctx: Context) {
    try {
      const { email, password, name, role } = ctx.request.body;

      if (!email || !password) {
        ctx.status = 400;
        ctx.body = { error: "Email e senha são obrigatórios" };
        return;
      }

      const userInDatabase = await userService.findByEmail(email);

      let definitiveRole = role?.toLowerCase();

      if (definitiveRole !== "admin" && definitiveRole !== "user") {
        definitiveRole = "user";
      }

      if (userInDatabase) {
        const authenticate = await userService.authenticateUser(
          email,
          password
        );

        return (ctx.body = {
          message: "Autenticação bem-sucedida",
          user: userInDatabase,
          token: authenticate.accessToken,
        });
      } else {
        if (definitiveRole === "admin") {
          const user = ctx.state.user;

          if (!user || !user.role || user.role !== "admin") {
            ctx.status = 403;
            ctx.body = {
              message: "Usuário não tem permissão para criar um admin.",
            };
            return;
          }
        }

        // Cria o novo usuário
        const newUser = { email, name, role: definitiveRole };
        const createdUser = await userService.createUser(newUser);

        // Registra no Cognito
        await userService.signUpUser(email, password, definitiveRole);

        return (ctx.body = {
          message: "Usuário registrado e autenticado",
          user: createdUser,
        });
      }
    } catch (error) {
      // Tratamento de erros
      ctx.status = 500;
      ctx.body = {
        error:
          "Erro inesperado: " +
          (error instanceof Error ? error.message : "Erro desconhecido"),
      };
    }
  }

  /**
   * Recupera as informações do usuário autenticado com base no email.
   * Retorna os dados do usuário, como ID, email, role e nome.
   */
  static async listUser(ctx: Context) {
    try {
      const { email } = ctx.state.user;

      if (!email) {
        ctx.status = 400;
        ctx.body = { message: "Email não informado" };
        return;
      }

      const user = await userService.findByEmail(email);

      if (!user) {
        ctx.status = 404;
        ctx.body = { message: "Usuário não encontrado" };
        return;
      }

      ctx.body = {
        message: "Usuário recuperado com sucesso",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        error: error instanceof Error ? error.message : "Erro inesperado",
      };
    }
  }

  /**
   * Atualiza as informações de um usuário.
   * Verifica se o usuário está tentando atualizar seu próprio perfil ou se é um administrador.
   * Caso seja admin, pode atualizar a role, mas não a própria role.
   * Se for o próprio usuário, marca o campo 'isOnboarded' como true.
   */
  static async updateUser(ctx: Context) {
    try {
      const { email } = ctx.state.user;
      const id = Number(ctx.params.id);
      const { name, role } = ctx.request.body;

      let definitiveRole: string | undefined = role?.toLowerCase();

      if (definitiveRole !== "admin" && definitiveRole !== "user") {
        definitiveRole = "user";
      }

      let userToUpdate = await userService.findByEmail(email);
      if (!userToUpdate) {
        ctx.status = 404;
        ctx.body = { message: "Usuário não encontrado" };
        return;
      }

      if (ctx.request.body.email && ctx.request.body.email !== email) {
        userToUpdate = await userService.findByEmail(ctx.request.body.email);
        if (!userToUpdate) {
          ctx.status = 404;
          ctx.body = {
            message: "Usuário com o email informado não encontrado",
          };
          return;
        }
      }

      const isAdmin = ctx.state.user.role === "admin";

      if (!isAdmin && userToUpdate.id !== id) {
        ctx.status = 403;
        ctx.body = { message: "Usuário comum não pode editar outro usuário" };
        return;
      }

      if (!isAdmin && role) {
        ctx.status = 400;
        ctx.body = { message: "Usuário comum não pode alterar a role" };
        return;
      }

      if (isAdmin && role && userToUpdate.id === id) {
        ctx.status = 400;
        ctx.body = { message: "Admin não pode alterar sua própria role" };
        return;
      }

      const updateData: {
        name?: string;
        role?: string;
        isOnboarded?: boolean;
      } = { name, role: definitiveRole };

      if (userToUpdate.id === id) {
        updateData.isOnboarded = true;
      }

      const updatedUser = await userService.updateUser(id, updateData);

      if (!updatedUser) {
        ctx.status = 404;
        ctx.body = { message: "Usuário não encontrado" };
        return;
      }

      ctx.body = {
        message: "Usuário atualizado com sucesso",
        user: updatedUser,
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        error: error instanceof Error ? error.message : "Erro inesperado",
      };
    }
  }

  /**
   * Recupera todos os usuários registrados no sistema.
   * Retorna a lista de usuários.
   */
  static async getAllUsers(ctx: Context) {
    ctx.body = await userService.getAllUsers();
  }
}
