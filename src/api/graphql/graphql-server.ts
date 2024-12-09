import 'reflect-metadata';
import Container from 'typedi';
import path from 'path';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { buildSchema } from 'type-graphql';
import { UserResolver } from '@graphql/module/user/user.resolver';
import { customAuthChecker } from '@graphql/auth-middleware';
import { customFormatErrors } from '@graphql/graphql-error.formater';
import { AddressResolver } from '@graphql/module/address/address.resolver';
import { graphqlUploadExpress } from 'graphql-upload-ts';

const app = express();
const httpServer = http.createServer(app);

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
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  app.use(
    '/',
    cors({ origin: '*', credentials: true }),
    graphqlUploadExpress({
      maxFiles: 10,
    }),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const token = req.headers.authorization || '';
        let userId: number;
        return { userId, token };
      },
    }),
  );

  await new Promise<void>((resolve) => httpServer.listen({ port }, resolve));
  console.log(`🚀 Server ready at http://localhost:4000/`);

  return server;
}
