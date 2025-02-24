import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { UserDTO } from "../dtos/UserDTO";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  GetUserCommand,
  AuthFlowType,
  SignUpCommand,
  AdminUpdateUserAttributesCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import crypto from "crypto";
import { log } from "console";

const clientId = process.env.CLIENT_ID || "";
const clientSecret = process.env.CLIENT_SECRET || "";
const userPoolId = process.env.USER_POOL_ID || "";

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export class UserService {
  private userRepository = AppDataSource.getRepository(User);

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async updateUser(id: number, data: Partial<UserDTO>): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) return null;

    // Atualiza o banco de dados local
    Object.assign(user, data);
    await this.userRepository.save(user);

    try {
      const userAttributes = [];

      if (data.name) {
        userAttributes.push({ Name: "name", Value: data.name });
      }
      if (data.role) {
        userAttributes.push({ Name: "custom:role", Value: data.role });
      }

      userAttributes.push({
        Name: "custom:isOnboarded",
        Value: "true",
      });

      if (userAttributes.length > 0) {
        const updateParams = {
          UserPoolId: userPoolId,
          Username: user.email,
          UserAttributes: userAttributes,
        };

        // Use o comando correto
        const command = new AdminUpdateUserAttributesCommand(updateParams);
        await cognitoClient.send(command);
        console.log("Usuário atualizado no Cognito com sucesso!");
      }

      return user;
    } catch (error) {
      console.error("Erro ao atualizar usuário no Cognito:", error);
      throw new Error("Falha ao atualizar usuário no Cognito");
    }
  }

  async authenticateUser(
    email: string,
    password: string
  ): Promise<{ accessToken: string; profile: string }> {
    let authParameters: Record<string, string> = {
      USERNAME: email,
      PASSWORD: password,
    };

    // Adiciona SECRET_HASH apenas se necessário
    if (clientSecret) {
      const secretHash = crypto
        .createHmac("sha256", clientSecret)
        .update(email + clientId)
        .digest("base64");

      authParameters.SECRET_HASH = secretHash;
    }

    const params = {
      AuthFlow: "USER_PASSWORD_AUTH" as AuthFlowType,
      ClientId: clientId,
      AuthParameters: authParameters,
    };

    const command = new InitiateAuthCommand(params);

    try {
      const data = await cognitoClient.send(command);

      if (data.AuthenticationResult?.AccessToken) {
        const accessToken = data.AuthenticationResult.AccessToken;

        const userParams = {
          AccessToken: accessToken,
        };
        const userCommand = new GetUserCommand(userParams);

        const userData = await cognitoClient.send(userCommand);

        const profile =
          userData.UserAttributes?.find((attr) => attr.Name === "profile")
            ?.Value || "";

        return {
          accessToken,
          profile,
        };
      } else {
        throw new Error("ID Token não encontrado na resposta do Cognito");
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error("Erro ao autenticar no Cognito: " + error.message);
      } else {
        throw new Error("Erro desconhecido ao autenticar no Cognito");
      }
    }
  }

  async signUpUser(email: string, password: string, role: string) {
    const secretHash = crypto
      .createHmac("sha256", clientSecret)
      .update(email + clientId)
      .digest("base64");

    const signUpParams = {
      ClientId: clientId,
      Username: email,
      Password: password,
      SecretHash: secretHash,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "custom:role", Value: role },
      ],
    };
    try {
      // Criar usuário no Cognito
      const signUpCommand = new SignUpCommand(signUpParams);
      
      await cognitoClient.send(signUpCommand);

      console.log("Usuário criado com sucesso!");

      // // Confirmar usuário automaticamente (requer credenciais de admin)
      // const confirmParams = {
      //   UserPoolId: userPoolId,
      //   Username: email,
      // };

      // const confirmCommand = new AdminConfirmSignUpCommand(confirmParams);
      // await cognitoClient.send(confirmCommand);
      //console.log("Usuário confirmado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar ou confirmar usuário:", error);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return await this.userRepository.save(user);
  }
}
