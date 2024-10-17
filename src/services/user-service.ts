import * as argon2 from 'argon2';
import { User } from '@prisma/client';
import { UserInput } from '../zod-schema/user-validation.js';
import { UserValidationSchema } from '../zod-schema/user-validation.js';
import { GraphQLError } from 'graphql';
import { prisma } from '../../prisma/prisma-client.js';

export class UserService {
  async createUserService(params: UserInput): Promise<User> {
    const verification = UserValidationSchema.safeParse(params);

    if (!verification.success) {
      const zoderrors = verification.error.errors.map((error) => ({
        path: error.path.join('.'),
        message: error.message,
      }));

      throw new GraphQLError('BAD_USER_INPUT: Please check the input fields and try again', {
        extensions: {
          code: '400',
          additionalInfo: zoderrors,
        },
      });
    }

    params.password = await argon2.hash(params.password);
    const { name, email, password, birthDate } = params;

    const userExists = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (userExists) {
      throw new GraphQLError('Registration Failed: the providen email is already taken!', {
        extensions: {
          code: '400',
          additionalInfo: 'Please try again using another email',
        },
      });
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password,
        birthDate,
      },
    });

    return newUser;
  }

  async showUsersService(): Promise<User[]> {
    const users = await prisma.user.findMany();

    if (users.length === 0) {
      throw new Error('Nenhum usuário encontrado');
    }

    return users;
  }
}
