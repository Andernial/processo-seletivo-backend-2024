import axios from 'axios';
import jwt from 'jsonwebtoken';
import * as argon2 from 'argon2';
import { serverUrl } from './server-setup-test.js';
import { expect } from 'chai';
import { prisma } from './server-setup-test.js';
import { formatTokenDate, returnExpirationDate } from './utils/dateUtils.js';

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

let userId: number;

describe('Login mutation Tests', function () {
  before(async () => {
    const password = await argon2.hash('45687a');

    const data = {
      name: 'usuarioLog',
      email: 'usuario@example.com',
      password,
      birthDate: '2003-01-01',
    };

    const newUser = await prisma.user.create({
      data,
    });

    userId = newUser.id;
  });

  after(async () => {
    await prisma.user.deleteMany();
  });

  it('should return login information and a token that expires in 168 hours', async () => {
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

    const { expirationDateTokenTrue } = returnExpirationDate();
    const responseData = response.data.data.login;
    const decodedToken = jwt.verify(responseData.token, process.env.SECRET_KEY ?? '');
    const { exp, id } = decodedToken as { exp: number; id: number };
    const tokenExpirationDate = formatTokenDate(exp);
    expect(response.data.data).to.have.property('login');
    expect(responseData.user).to.have.all.keys('name', 'email', 'birthDate', 'id');
    expect(responseData.user.name).to.equal('usuarioLog');
    expect(responseData.user.email).to.equal('usuario@example.com');
    expect(responseData.user.birthDate).to.equal('2003-01-01');
    expect(responseData).to.have.property('token');
    expect(tokenExpirationDate).to.equal(expirationDateTokenTrue);
    expect(decodedToken).to.have.all.keys('id', 'iat', 'exp');
    expect(id).to.equal(userId);
  });

  it('should return login information and a token that expires in 8 hours', async () => {
    const variables = {
      loginInput: {
        email: 'usuario@example.com',
        rememberMe: false,
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

    const { expirationDateTokenFalse } = returnExpirationDate();
    const responseData = response.data.data.login;
    const decodedToken = jwt.verify(responseData.token, process.env.SECRET_KEY ?? '');
    const { exp, id } = decodedToken as { exp: number; id: number };
    const tokenExpirationDate = formatTokenDate(exp);
    expect(response.data.data).to.have.property('login');
    expect(responseData.user).to.have.all.keys('name', 'email', 'birthDate', 'id');
    expect(responseData.user.name).to.equal('usuarioLog');
    expect(responseData.user.email).to.equal('usuario@example.com');
    expect(responseData.user.birthDate).to.equal('2003-01-01');
    expect(responseData).to.have.property('token');
    expect(tokenExpirationDate).to.equal(expirationDateTokenFalse);
    expect(decodedToken).to.have.all.keys('id', 'iat', 'exp');
    expect(id).to.equal(userId);
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

    expect(response.data).to.have.property('errors');
    const responseData = response.data.errors[0];
    expect(responseData.message).to.equal('USER_NOT_FOUND: Could not find a user with that email or password');
    expect(responseData.extensions.code).to.equal('404');
    expect(responseData.extensions.additionalInfo).to.equal('Please verify email or password and try again');
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

    expect(response.data).to.have.property('errors');

    const responseData = response.data.errors[0];
    expect(responseData.message).to.equal('USER_NOT_FOUND: Could not find a user with that email or password');
    expect(responseData.extensions.code).to.equal('404');
    expect(responseData.extensions.additionalInfo).to.equal('Please verify email or password and try again');
  });
});
