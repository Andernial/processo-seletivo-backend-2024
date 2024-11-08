import axios from 'axios';
import * as argon2 from 'argon2';
import { serverUrl } from './server-setup-test.js';
import { expect } from 'chai';
import { prisma } from './server-setup-test.js';

const mutation = {
  query: `mutation Login($loginInput: UserLogin!) {
    login(input: $loginInput) {
      user {
      name
      birthDate
      email
      id
      }
  token
}
}`,
};

describe('Login mutation Tests', function () {
  before(async () => {
    await prisma.user.deleteMany();

    const password = await argon2.hash('45687a');

    const data = {
      name: 'usuarioLog',
      email: 'usuario@example.com',
      password: password,
      birthDate: '2003-01-01',
    };

    await prisma.user.create({
      data,
    });
  });

  it('should login and return the correct data', async () => {
    const variables = {
      loginInput: {
        email: 'usuario@example.com',
        rememberMe: true,
        password: '45687a',
      },
    };
    const response = await axios.post(
      serverUrl,
      { query: mutation.query, variables: variables },
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );
    expect(response.data.data).to.have.property('login');
    const responseData = response.data.data.login;
    expect(responseData.user).to.have.all.keys('name', 'email', 'birthDate', 'id');
    expect(responseData.user.name).to.equal('usuarioLog');
    expect(responseData).to.have.property('token');
  });

  it('should throw errors when trying to log in with invalid email', async () => {
    const variables = {
      loginInput: {
        email: 'wrongEmail@gmail.com',
        rememberMe: true,
        password: '45687a',
      },
    };
    const response = await axios.post(
      serverUrl,
      { query: mutation.query, variables: variables },
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );
    const responseData = response.data.errors[0];
    expect(responseData.message).to.equal('USER_NOT_FOUND: cannot find any user with that email');
    expect(responseData.extensions.code).to.equal('400');
    expect(responseData.extensions.additionalInfo).to.equal('Please try again using a different email');
  });

  it('should throw errors when trying to log in with invalid password', async () => {
    const variables = {
      loginInput: {
        email: 'usuario@example.com',
        rememberMe: true,
        password: 'wrongpass',
      },
    };
    const response = await axios.post(
      serverUrl,
      { query: mutation.query, variables: variables },
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );
    const responseData = response.data.errors[0];
    expect(responseData.message).to.equal('BAD_USER_INPUT: the providen password does not match!');
    expect(responseData.extensions.code).to.equal('400');
    expect(responseData.extensions.additionalInfo).to.equal('Please try again using a different password');
  });
});
