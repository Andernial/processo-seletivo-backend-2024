import axios from 'axios';
import { prisma, serverUrl } from './server-setup-test.js';
import { describe, it } from 'mocha';
import jwt from 'jsonwebtoken';
import { expect } from 'chai';

let testToken: string;
let newUserId: number;

const query = {
  query: `query User($input: FindUserInput!) {
  user(input: $input) {
    id
    name
    email
    birthDate
  }
}`,
};

describe('User Query test', function () {
  before(async () => {
    const newUser = await prisma.user.create({
      data: {
        name: 'usuario',
        email: 'usuario@example.com',
        password: '45687a',
        birthDate: '2003-01-01',
      },
    });

    newUserId = newUser.id;

    testToken = jwt.sign({ id: newUserId }, process.env.SECRET_KEY ?? '', { expiresIn: '1h' });
  });

  after(async () => {
    await prisma.user.deleteMany();
  });

  it('should return an user if a correct user id and token are provided', async () => {
    const variables = {
      input: {
        id: newUserId,
      },
    };
    const response = await axios.post(
      serverUrl,
      { query: query.query, variables },
      {
        headers: { 'Content-Type': 'application/json', Authorization: testToken },
      },
    );

    const responseData = response.data.data.user;
    expect(responseData).to.have.property('id');
    expect(responseData.name).to.equal('usuario');
    expect(responseData.email).to.equal('usuario@example.com');
    expect(responseData.birthDate).to.equal('2003-01-01');
  });

  it('should return an error if an incorrect user id is provided', async () => {
    const variables = {
      input: {
        id: 1,
      },
    };
    const response = await axios.post(
      serverUrl,
      { query: query.query, variables },
      {
        headers: { 'Content-Type': 'application/json', Authorization: testToken },
      },
    );

    const responseData = response.data.errors[0];
    expect(responseData.message).to.equal('USER_NOT_FOUND: Could not find user with the providen id!');
    expect(responseData.extensions.additionalInfo).to.equal('Please try again using a different id');
    expect(responseData.extensions.code).to.equal('404');
  });

  it('should return an error if no token is provided', async () => {
    const variables = {
      input: {
        id: newUserId,
      },
    };
    const response = await axios.post(
      serverUrl,
      { query: query.query, variables },
      {
        headers: { 'Content-Type': 'application/json', Authorization: null },
      },
    );

    const responseData = response.data.errors[0];
    expect(responseData.message).to.equal('ACCESS_DENIED: You need to be logged in to access this query');
    expect(responseData.extensions.additionalInfo).to.equal('try again providing a jwt login token');
    expect(responseData.extensions.code).to.equal('401');
  });

  it('should return an error if a malformed token is provided', async () => {
    const variables = {
      input: {
        id: newUserId,
      },
    };
    const response = await axios.post(
      serverUrl,
      { query: query.query, variables },
      {
        headers: { 'Content-Type': 'application/json', Authorization: 'malformed token' },
      },
    );

    const responseData = response.data.errors[0];
    expect(responseData.message).to.equal('INVALID_SESSION_TOKEN: Error invalid or expired token');
    expect(responseData.extensions.additionalInfo.name).to.equal('JsonWebTokenError');
    expect(responseData.extensions.additionalInfo.message).to.equal('jwt malformed');
    expect(responseData.extensions.code).to.equal('401');
  });
});
