import { UserService } from '../services/user-service.js';
import { UserInput } from '../intefaces/interfaces.js';
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
      return {
        id: createNewUser.id,
        name: createNewUser.name,
        email: createNewUser.email,
        birthDate: createNewUser.birthDate,
      };
    },
  },
};
