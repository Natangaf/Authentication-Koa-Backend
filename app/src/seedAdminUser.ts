import { AppDataSource } from "./data-source";
import { User } from "./entities/User";
import { UserService } from "./services/UserService";

const userService = new UserService();

export const seedAdminUser = async () => {
  const userRepository = AppDataSource.getRepository(User);

  const email = "admin@example.com";
  const password = "Admin@Password123";
  const name = "Admin";

  // Verifica se o usuário admin já existe
  const existingAdmin = await userRepository.findOne({ where: { email } });

  if (!existingAdmin) {
    try {
      // Tenta criar o usuário no Cognito
      await userService.signUpUser(email, password);
      
      // Se a criação no Cognito for bem-sucedida, cria o usuário no banco de dados
      const adminUser = userRepository.create({
        name,
        email,
        role: "admin",
        isOnboarded: true,
      });

      await userRepository.save(adminUser);
      console.log("Usuário admin criado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar o usuário admin:", error);
    }
  } else {
    console.log("Usuário admin já existe.");
  }
};
