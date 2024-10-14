import axios from 'axios';
import { ApolloServer } from '@apollo/server';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { typeDefs } from '../src/graphql/type-defs.js';
import { resolvers } from '../src/graphql/resolvers.js';
import { startStandaloneServer } from '@apollo/server/standalone';

describe('server test', function () {
  let server: ApolloServer;
  let serverUrl: string;

  before(async () => {
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
    await server.stop();
  });

  it('should fetch users using Axios', async () => {
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

    expect(response.data.data).to.have.property('users');
    expect(response.data.data.users).to.be.an('array');

    expect(response.data.data.users.length).to.be.greaterThan(0);
    const firstUser = response.data.data.users[0];
    expect(firstUser).to.have.all.keys('id', 'name', 'email', 'birthDate');
  });
});
