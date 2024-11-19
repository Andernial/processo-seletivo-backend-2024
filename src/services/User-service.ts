import * as argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import { UserInput } from '../zod-schema/user-validation.js';
import { UserValidationSchema } from '../zod-schema/user-validation.js';
import { GraphQLError } from 'graphql';
import { prisma } from '../../prisma/prisma-client.js';
import { base64Encode, decodeObject } from '../utils/encoder-utils.js';
import {
  FindUserInput,
  FindUsersInput,
  LoginReturn,
  UserLoginInput,
  UsersQueryReturn,
} from '../interfaces/interfaces.js';

export class UserService {
  async createUserService(params: UserInput): Promise<User> {
    const validation = UserValidationSchema.safeParse(params);

    if (!validation.success) {
      const zoderrors = validation.error.errors.map((error) => ({
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

    const userExists = await prisma.user.findUnique({
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

  async showUsersService(params: FindUsersInput = { quantity: 10 }): Promise<UsersQueryReturn> {
    const { quantity, cursor } = params;

    const decodedString = cursor ? decodeObject(cursor) : null;
    const usersTotal = await prisma.user.count();
    const users = await prisma.user.findMany({
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      take: quantity ? quantity : 10,
      skip: cursor ? 1 : undefined,
      cursor: decodedString ? { name_id: { name: decodedString.name, id: decodedString.id } } : undefined,
    });

    if (users.length === 0) {
      const data = {
        usersData: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          nextCursor: undefined,
        },
        usersTotal,
      };

      return data;
    }

    const lastUserInQuery = users[users.length - 1];
    const encodedNewCursor = base64Encode({ name: lastUserInQuery.name, id: lastUserInQuery.id });

    const nextPage = await prisma.user.count({
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      skip: 1,
      cursor: { name_id: { name: lastUserInQuery.name, id: lastUserInQuery.id } },
    });

    const hasNextPage = nextPage > 0 ? true : false;
    const hasPreviousPage = cursor ? true : false;
    const data = {
      usersData: users,
      pageInfo: {
        hasNextPage,
        hasPreviousPage,
        nextCursor: hasNextPage ? encodedNewCursor : undefined,
      },
      usersTotal,
    };

    return data;
  }

  async logInUserService(params: UserLoginInput): Promise<LoginReturn> {
    const { email, password, rememberMe } = params;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new GraphQLError('USER_NOT_FOUND: Could not find a user with that email or password', {
        extensions: {
          code: '404',
          additionalInfo: 'Please verify email or password and try again',
        },
      });
    }

    const hashedPassword = user?.password;
    const isPasswordHashed = await argon2.verify(hashedPassword, password);

    if (!isPasswordHashed) {
      throw new GraphQLError('USER_NOT_FOUND: Could not find a user with that email or password', {
        extensions: {
          code: '404',
          additionalInfo: 'Please verify email or password and try again',
        },
      });
    }
    const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY ?? '', { expiresIn: !rememberMe ? '8h' : '168h' });

    const fullResult = { user, token };

    return fullResult;
  }

  async getUserByIdService(params: FindUserInput): Promise<User> {
    const { id } = params;

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new GraphQLError('USER_NOT_FOUND: Could not find user with the provided id!', {
        extensions: {
          code: '404',
          additionalInfo: 'Please try again using a different id',
        },
      });
    }

    return user;
  }
}
