import { UserService } from '../services/user-service.js';
import { UserInput } from '../zod-schema/user-validation.js';
const instanceOfUserService = new UserService();

export const resolvers = {
  Query: {
    users: async () => {
      const users = await instanceOfUserService.showUsersService();
      return users;
    },
  },

  Mutation: {
    createUser: async (_: unknown, { input }: { input: UserInput }) => {
      const createNewUser = await instanceOfUserService.createUserService(input);
      return createNewUser;
    },
  },
};
