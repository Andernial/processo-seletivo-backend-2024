export const typeDefs = `#graphql
   type Message {
    message: String
   }

   type User {
    id: ID!
    name: String!
    email: String!
    password: String!
    birthDate: String!
   }

   input UserInput{
    name: String!
    email: String!
    password: String!
    birthDate: String!
   }

   type Mutation{
    createUser(input: UserInput!): User!
   }

   type Query {
    hello: String
    messages: [Message]
    getMessage(index: Int!): Message
    users: [User!]!
  }
`;
