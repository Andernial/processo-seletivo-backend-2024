import { PrismaClient, User } from '@prisma/client';
import { UserInput } from '../zod-schema/user-validation.js';
import { UserValidationSchema } from '../zod-schema/user-validation.js';
import { GraphQLError } from 'graphql';
const prisma = new PrismaClient();

export class UserService {
  async createUserService(params: UserInput): Promise<User> {
    try {
      UserValidationSchema.parse(params);

      const { name, email, password, birthDate } = params;
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password,
          birthDate,
        },
      });

      return newUser;
    } catch (error) {
      console.log(error);
      throw new GraphQLError('Erro Ao Criar Usuário', {
        extensions: { code: 'Internal_Server_Error' },
      });
    }
  }

  async showUsersService(): Promise<User[]> {
    try {
      const users = await prisma.user.findMany();

      if (users.length === 0) {
        throw new Error('Nenhum usuário encontrado');
      }

      return users;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
