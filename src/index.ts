import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from '@apollo/server/standalone';
const port = 4000;

const typeDefs = `
   type Message {
    message: String
   }

   type Query {
    hello: String
    messages: [Message]
    getMessage(index: Int!): Message
  }
`;

const messages = [
    {
        message: 'Hello World!'
    },
    {
        message: "First Apollo StandaloneServer!"
    },
    {
        message: "Welcome Again!"
    }
]

const resolvers = {
    Query: {
        hello: () => messages[0].message,
        messages: () => messages,
        getMessage: (_, { index }) => messages[index],

    },
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

const { url } = await startStandaloneServer(server, {
    listen: { port },
});

console.log(`🚀 Server ready at: ${url}`);
