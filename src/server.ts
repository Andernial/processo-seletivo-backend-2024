import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './graphql/type-defs.js';
import { resolvers } from './graphql/resolvers.js';
import { verifyToken } from './middlewares/jwt-verify.js';
const port = 4000;

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port },
  context: async ({ req }) => {
    const token = req.headers.authorization || '';

    if (token) {
      const user = verifyToken(token);
      return user;
    }
    return { user: null };
  },
});

console.log(`🚀 Server ready at: ${url}`);
