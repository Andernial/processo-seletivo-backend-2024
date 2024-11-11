export const typeDefs = `#graphql
   type User {
    id: ID!
    name: String!
    email: String!
    birthDate: String!
   }

   type Login {
     user: User!
     token: String!
   }

   input UserInput{
    name: String!
    email: String!
    password: String!
    birthDate: String!
   }

   input UserLogin{
      email: String!
      password: String!
      rememberMe: Boolean
   }

   input FindUserInput{
    id: Int!
   }

   type Mutation{
    createUser(input: UserInput!): User!
    login(input: UserLogin!): Login!
   }

   type Query {
    users: [User!]!
    user(input: FindUserInput!): User!
  }
`;
