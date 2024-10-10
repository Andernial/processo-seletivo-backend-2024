const messages = [
  {
    message: 'Hello World!',
  },
  {
    message: 'First Apollo StandaloneServer!',
  },
  {
    message: 'Welcome Again!',
  },
];

const users: UserInput[] = [];

interface UserInput {
  id: number;
  name: string;
  email: string;
  password: string;
  birthDate: string;
}

export const resolvers = {
  Query: {
    hello: () => messages[0].message,
    messages: () => messages,
    getMessage: (_: unknown, { index }: { index: number }) => messages[index],
    users: () => users,
  },

  Mutation: {
    createUser: (_: unknown, { input }: { input: UserInput }) => {
      const newUser: UserInput = {
        id: users.length > 0 ? users[users.length - 1].id + 1 : users.length + 1,
        name: input.name,
        email: input.email,
        password: input.password,
        birthDate: input.birthDate,
      };
      users.push(newUser);
      return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        birthDate: newUser.birthDate,
      };
    },
  },
};
