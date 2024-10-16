import axios from 'axios';
import { ApolloServer } from '@apollo/server';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { typeDefs } from '../src/graphql/type-defs.js';
import { resolvers } from '../src/graphql/resolvers.js';
import { startStandaloneServer } from '@apollo/server/standalone';
import { PrismaClient } from '@prisma/client';

describe('server test', function () {
  let prisma: PrismaClient;
  let server: ApolloServer;
  let serverUrl: string;

  before(async () => {
    prisma = new PrismaClient();
    server = new ApolloServer({
      typeDefs,
      resolvers,
    });

    const { url } = await startStandaloneServer(server, {
      listen: { port: 0 },
    });
    console.log('running server ', url);
    serverUrl = url;
  });

  after(async () => {
    await prisma.$disconnect();
    await server.stop();
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  it('should create users and find the created user using axios request', async () => {
    const mutation = {
      query: `mutation CreateUser($createUserInput: UserInput!) {
        createUser(input: $createUserInput) {
          birthDate
          email
          id
          name
        }
      }`,
      variables: {
        createUserInput: {
          name: 'usuario',
          email: 'usuario@example.com',
          password: '45687a',
          birthDate: '2003-01-01',
        },
      },
    };
    const responseQuery = await axios.post(serverUrl, mutation, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const createdUser = responseQuery.data.data.createUser;
    expect(createdUser).to.have.property('id');
    expect(createdUser.name).to.equal('usuario');
    expect(createdUser.email).to.equal('usuario@example.com');
    const queryData = {
      query: `query getUsers {
        users {
          id
          name
          email
          birthDate
        }
      }`,
    };
    const response = await axios.post(serverUrl, queryData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const allUsers = response.data.data;
    expect(allUsers).to.have.property('users');
    expect(allUsers.users).to.be.an('array');
    expect(allUsers.users.length).to.be.greaterThan(0);
    const firstUser = allUsers.users[0];
    expect(firstUser).to.have.all.keys('id', 'name', 'email', 'birthDate');
  });

  it('it should return errors while trying to create a user with a already taken email', async () => {
    const mutation = {
      query: `mutation CreateUser($createUserInput: UserInput!) {
          createUser(input: $createUserInput) {
            birthDate
            email
            id
            name
          }
        }`,
      variables: {
        createUserInput: {
          name: 'usuario',
          email: 'usuario@example.com',
          password: '45687a',
          birthDate: '2003-01-01',
        },
      },
    };
    await axios.post(serverUrl, mutation, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await axios.post(serverUrl, mutation, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const responseData = response.data.errors[0];
    expect(responseData.message).to.equal('BAD_USER_INPUT');
    expect(responseData.extensions.code).to.equal('400');
    expect(responseData.extensions.message).to.equal('email is already taken');
  });

  it('it should return errors while trying to create a user with invalid inputs', async () => {
    const mutation = {
      query: `mutation CreateUser($createUserInput: UserInput!) {
          createUser(input: $createUserInput) {
            birthDate
            email
            id
            name
          }
        }`,
      variables: {
        createUserInput: {
          name: 'usuario',
          email: 'usuario@example.com',
          password: '21',
          birthDate: '2003-01-01',
        },
      },
    };

    const response = await axios.post(serverUrl, mutation, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const responseData = response.data.errors[0];
    expect(responseData.message).to.equal('BAD_USER_INPUT');
    expect(responseData.extensions.code).to.equal('400');
    expect(responseData.extensions.additionalInfo[0].message).to.equal('Senha deve conter pelo menos 6 caracteres');
    expect(responseData.extensions.additionalInfo[1].message).to.equal(
      'A senha deve conter pelo menos 1 letra e um número',
    );
  });
});
