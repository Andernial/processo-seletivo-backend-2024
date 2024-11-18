import { GraphQLError } from 'graphql';
import { FindUserInput, FindUsersInput, Token, UserLoginInput } from '../interfaces/interfaces.js';
import { UserService } from '../services/user-service.js';
import { UserInput } from '../zod-schema/user-validation.js';
const instanceOfUserService = new UserService();

export const resolvers = {
  Query: {
    users: async (_: unknown, { input }: { input: FindUsersInput }, contextValue: Token) => {
      if (!contextValue.id) {
        throw new GraphQLError('ACCESS_DENIED: You need to be logged in to access this query', {
          extensions: {
            code: '401',
            additionalInfo: 'try again providing a jwt login token',
          },
        });
      }
      return await instanceOfUserService.showUsersService(input);
    },

    user: async (_: unknown, { input }: { input: FindUserInput }, contextValue: Token) => {
      if (!contextValue.id) {
        throw new GraphQLError('ACCESS_DENIED: You need to be logged in to access this query', {
          extensions: {
            code: '401',
            additionalInfo: 'try again providing a jwt login token',
          },
        });
      }
      return await instanceOfUserService.getUserByIdService(input);
    },
  },

  Mutation: {
    createUser: async (_: unknown, { input }: { input: UserInput }) => {
      return await instanceOfUserService.createUserService(input);
    },

    login: async (_: unknown, { input }: { input: UserLoginInput }) => {
      return await instanceOfUserService.logInUserService(input);
    },
  },
};
