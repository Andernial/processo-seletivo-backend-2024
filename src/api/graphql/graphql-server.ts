import 'reflect-metadata';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { buildSchema } from 'type-graphql';
import { UserResolver } from '@graphql/module/user/user.resolver';
import Container from 'typedi';
import path from 'path';
import { customAuthChecker } from '@graphql/auth-middleware';
import { customFormatErrors } from '@graphql/graphql-error.formater';
import { AddressResolver } from '@graphql/module/address/address.resolver';

export async function bootstrap(port: number): Promise<ApolloServer> {
  const schema = await buildSchema({
    resolvers: [UserResolver, AddressResolver],
    container: Container,
    emitSchemaFile: path.resolve(__dirname + '/schema.graphql'),
    authChecker: customAuthChecker,
    validate: true,
  });

  const server = new ApolloServer({
    schema,
    formatError: customFormatErrors,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port },
    context: async ({ req }) => {
      const token = req.headers.authorization || '';
      let userId: number;
      return { userId, token };
    },
  });

  console.log(`🚀 Server ready at: ${url}`);
  return server;
}
