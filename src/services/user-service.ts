import { PrismaClient, User } from '@prisma/client';
import { UserInput } from '../intefaces/interfaces.js';

const prisma = new PrismaClient();

export class UserService {
  async createUserService(params: UserInput): Promise<User> {
    const { name, email, password, birthDate } = params;
    try {
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
      throw error;
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
