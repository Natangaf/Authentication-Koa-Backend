import { Context } from "koa";
import { UserService } from "../services/UserService";

const userService = new UserService();

export class UserController {
  /**
   * Autentica um usuário com email e senha.
   * Se o usuário não existir, cria um novo usuário e retorna os dados junto com o token.
   * Se o usuário já existir, retorna os dados do usuário junto com o token de autenticação.
   */
  static async authUser(ctx: Context) {
    try {
      const { email, password } = ctx.request.body;

      if (!email || !password) {
        ctx.status = 400;
        ctx.body = { error: "Email e senha são obrigatórios" };
        return;
      }
      // Passo 1: Verifica se existe no banco local
      const userInDatabase = await userService.findByEmail(email);
      if (userInDatabase) {
        // Passo 2 : se  existir Tenta autenticar no Cognito
        const authenticate = await userService.authenticateUser(
          email,
          password
        );
        // Retona
        return (ctx.body = {
          message: "Autenticação bem-sucedida",
          user: userInDatabase,
          token: authenticate.accessToken,
        });
      } else {
        // Usuário não existe no Cognito → Cadastra
        await userService.signUpUser(email, password);
        // const authenticate = await userService.authenticateUser(
        //   email,
        //   password
        // );

        const newUser = { email};
        const createdUser = await userService.createUser(newUser);

        return (ctx.body = {
          message: "Usuário registrado e autenticado",
          user: createdUser,
         // token: authenticate.accessToken,
        });
      }
    } catch (error) {
      // Passo 4: Tratamento genérico de erros
      if (error instanceof Error) {
        ctx.status = 401;
        ctx.body = { error: "Erro na autenticação: " + error.message };
      } else {
        ctx.status = 500;
        ctx.body = { error: "Erro inesperado" };
      }
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
      } = { name, role };

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
