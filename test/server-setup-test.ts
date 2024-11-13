import { typeDefs } from '../src/graphql/type-defs.js';
import { resolvers } from '../src/graphql/resolvers.js';
import { startStandaloneServer } from '@apollo/server/standalone';
import { PrismaClient } from '@prisma/client';
import { ApolloServer } from '@apollo/server';
import { verifyToken } from '../src/middlewares/jwt-verify.js';

export const prisma = new PrismaClient();
let server: ApolloServer;
export let serverUrl: string;

before(async () => {
  if (!server) {
    server = new ApolloServer({
      typeDefs,
      resolvers,
    });

    const { url } = await startStandaloneServer(server, {
      listen: { port: 0 },
      context: async ({ req }) => {
        const token = req.headers.authorization || '';

        if (token) {
          const user = verifyToken(token);
          return user;
        }
        return { user: null };
      },
    });
    console.log('running server ', url);
    serverUrl = url;
  }
});

after(async () => {
  await prisma.$disconnect();
  await server.stop();
});
