export const typeDefs = `#graphql
   type User {
    id: ID!
    name: String!
    email: String!
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
    users: [User!]!
  }
`;
