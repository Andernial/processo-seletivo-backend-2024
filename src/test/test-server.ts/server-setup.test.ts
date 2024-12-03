import { PrismaClient } from '@prisma/client';
import { ApolloServer } from '@apollo/server';
import { bootstrap } from '@graphql/graphql-server';
const testPort = parseInt(process.env.PORT);
export const prisma = new PrismaClient();
let server: ApolloServer;
export let serverUrl: string;

before(async () => {
  if (!server) {
    server = await bootstrap(testPort);
  }
});

after(async () => {
  await prisma.user.deleteMany();
  await prisma.$disconnect();
  await server.stop();
});
