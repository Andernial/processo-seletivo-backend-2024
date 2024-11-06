import { GraphQLError } from 'graphql';
import { Token, UserLogin } from '../interfaces/interfaces.js';
import { UserService } from '../services/user-service.js';
import { UserInput } from '../zod-schema/user-validation.js';
const instanceOfUserService = new UserService();

export const resolvers = {
  Query: {
    users: async (_: unknown, _unusedInput: unknown, contextValue: Token) => {
      if (!contextValue.id) {
        throw new GraphQLError('ACCESS_DENIED: You need to be logged in to acess this query', {
          extensions: {
            code: '401',
            additionalInfo: 'try again providing a jwt login token',
          },
        });
      }
      const users = await instanceOfUserService.showUsersService();
      return users;
    },
  },

  Mutation: {
    createUser: async (_: unknown, { input }: { input: UserInput }) => {
      const createNewUser = await instanceOfUserService.createUserService(input);
      return createNewUser;
    },

    login: async (_: unknown, { input }: { input: UserLogin }) => {
      const findUser = instanceOfUserService.findUserService(input);
      return findUser;
    },
  },
};
