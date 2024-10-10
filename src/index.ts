import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './graphql/type-defs.js';
import { resolvers } from './graphql/resolvers.js';
const port = 4000;

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port },
});

console.log(`🚀 Server ready at: ${url}`);
