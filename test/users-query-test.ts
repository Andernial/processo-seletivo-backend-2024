import axios from 'axios';
import jwt from 'jsonwebtoken';
import { prisma, serverUrl } from './server-setup-test.js';
import { expect } from 'chai';
import { generateFakeUsers } from '../prisma/seed.js';
import { User } from '@prisma/client';
import { base64Encode } from '../src/utils/encoder-utils.js';

let testToken: string;

const query = {
  query: `query getUsers($usersInput: FindUsersInput) {
    users(input: $usersInput) {
      usersData { 
       id
       name
       email
       birthDate
      }
      
      pageInfo {
      hasNextPage
      hasPreviousPage
      nextCursor
      }
      usersTotal
    }
  }`,
};

describe('Users Query Test', function () {
  before(async () => {
    const data = generateFakeUsers(30);
    await prisma.user.createMany({ data });
    testToken = jwt.sign({ id: 1 }, process.env.SECRET_KEY ?? '', { expiresIn: '1h' });
  });

  after(async () => {
    await prisma.user.deleteMany();
  });
  it('should successfully return users if a valid token is sent', async () => {
    const response = await axios.post(
      serverUrl,
      { query: query.query },
      {
        headers: { 'Content-Type': 'application/json', Authorization: testToken },
      },
    );
    const testUsers = await prisma.user.findMany({
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      take: 10,
    });
    const lastUserInQuery = testUsers[testUsers.length - 1];
    const encodedCursor = base64Encode({ name: lastUserInQuery.name, id: lastUserInQuery.id });
    const responseUsersData = response.data.data.users.usersData;
    const responsePageInfo = response.data.data.users.pageInfo;

    expect(responseUsersData).to.have.length(10);
    responseUsersData.forEach((user: User, i: number) => {
      expect(user).to.have.all.keys('id', 'name', 'email', 'birthDate');
      expect(user.name).to.equal(testUsers[i].name);
      expect(user.email).to.equal(testUsers[i].email);
      expect(user.birthDate).to.equal(testUsers[i].birthDate);
    });
    expect(responsePageInfo).to.have.keys('hasNextPage', 'hasPreviousPage', 'nextCursor');
    expect(responsePageInfo.hasNextPage).to.equal(true);
    expect(responsePageInfo.hasPreviousPage).to.equal(false);
    expect(encodedCursor).to.be.an('string');
    expect(responsePageInfo.nextCursor).to.equal(encodedCursor);
    expect(response.data.data.users.usersTotal).to.equal(30);
  });

  it('should return the requested quantity of users based on the quantity and cursor', async () => {
    const firstUsers = await prisma.user.findMany({
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      take: 3,
    });

    const lastUserInQuery = firstUsers[firstUsers.length - 1];
    const encodedCursor = base64Encode({ name: lastUserInQuery.name, id: lastUserInQuery.id });
    const variables = {
      usersInput: {
        cursor: encodedCursor,
        quantity: 3,
      },
    };

    const response = await axios.post(
      serverUrl,
      { query: query.query, variables },
      {
        headers: { 'Content-Type': 'application/json', Authorization: testToken },
      },
    );

    const testUsers = await prisma.user.findMany({
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      take: 3,
      skip: 1,
      cursor: { name_id: { name: lastUserInQuery.name, id: lastUserInQuery.id } },
    });

    const lastUserInQuery2 = testUsers[testUsers.length - 1];
    const encodedCursor2 = base64Encode({ name: lastUserInQuery2.name, id: lastUserInQuery2.id });
    const responseUsersData = response.data.data.users.usersData;
    const responsePageInfo = response.data.data.users.pageInfo;

    responseUsersData.forEach((user: User, i: number) => {
      expect(user).to.have.all.keys('id', 'name', 'email', 'birthDate');
      expect(user.name).to.equal(testUsers[i].name);
      expect(user.email).to.equal(testUsers[i].email);
      expect(user.birthDate).to.equal(testUsers[i].birthDate);
    });
    expect(responsePageInfo).to.have.keys('hasNextPage', 'hasPreviousPage', 'nextCursor');
    expect(responsePageInfo.hasNextPage).to.equal(true);
    expect(responsePageInfo.hasPreviousPage).to.equal(true);
    expect(encodedCursor2).to.be.an('string');
    expect(responsePageInfo.nextCursor).to.equal(encodedCursor2);
    expect(response.data.data.users.usersTotal).to.equal(30);
  });

  it('should return the default quantity of users and show theres no more pages', async () => {
    const allUsers = await prisma.user.findMany({
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      take: 20,
    });

    const lastUserInQuery = allUsers[allUsers.length - 1];
    const encodedCursor = base64Encode({ name: lastUserInQuery.name, id: lastUserInQuery.id });
    const variables = {
      usersInput: {
        cursor: encodedCursor,
      },
    };

    const response = await axios.post(
      serverUrl,
      { query: query.query, variables },
      {
        headers: { 'Content-Type': 'application/json', Authorization: testToken },
      },
    );

    const testUsers = await prisma.user.findMany({
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      take: 10,
      skip: 20,
    });

    const responseUsersData = response.data.data.users.usersData;
    const responsePageInfo = response.data.data.users.pageInfo;

    responseUsersData.forEach((user: User, i: number) => {
      expect(user).to.have.all.keys('id', 'name', 'email', 'birthDate');
      expect(user.name).to.equal(testUsers[i].name);
      expect(user.email).to.equal(testUsers[i].email);
      expect(user.birthDate).to.equal(testUsers[i].birthDate);
    });
    expect(responsePageInfo).to.have.keys('hasNextPage', 'hasPreviousPage', 'nextCursor');
    expect(responsePageInfo.hasNextPage).to.equal(false);
    expect(responsePageInfo.hasPreviousPage).to.equal(true);
    expect(responsePageInfo.nextCursor).to.equal(null);
    expect(response.data.data.users.usersTotal).to.equal(30);
  });

  it('should return the an empty array of users if no users are found', async () => {
    await prisma.user.deleteMany();

    const response = await axios.post(
      serverUrl,
      { query: query.query },
      {
        headers: { 'Content-Type': 'application/json', Authorization: testToken },
      },
    );

    const responseUsersData = response.data.data.users.usersData;
    const responsePageInfo = response.data.data.users.pageInfo;

    expect(responseUsersData).to.have.length(0);
    expect(responsePageInfo).to.have.keys('hasNextPage', 'hasPreviousPage', 'nextCursor');
    expect(responsePageInfo.hasNextPage).to.equal(false);
    expect(responsePageInfo.hasPreviousPage).to.equal(false);
    expect(responsePageInfo.nextCursor).to.equal(null);
    expect(response.data.data.users.usersTotal).to.equal(0);
  });

  it('should return an error if a invalid or malformed cursor is provided', async () => {
    const variables = {
      usersInput: {
        cursor: 'badCursor',
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
    expect(responseData).to.have.all.keys('message', 'extensions', 'locations', 'path');
    expect(responseData.message).to.equal('INVALID_CURSOR: Invalid or malformed cursor string');
    expect(responseData.extensions.additionalInfo).to.equal('Please provide a valid cursor string');
    expect(responseData.extensions.code).to.equal('400');
  });

  it('should return an error if no token is provided', async () => {
    const response = await axios.post(
      serverUrl,
      { query: query.query },
      {
        headers: { 'Content-Type': 'application/json', Authorization: null },
      },
    );
    const responseData = response.data.errors[0];
    expect(responseData).to.have.all.keys('message', 'extensions', 'locations', 'path');
    expect(responseData.message).to.equal('ACCESS_DENIED: You need to be logged in to access this query');
    expect(responseData.extensions.additionalInfo).to.equal('try again providing a jwt login token');
    expect(responseData.extensions.code).to.equal('401');
  });

  it('should return an error if a malformed token is provided', async () => {
    const response = await axios.post(
      serverUrl,
      { query: query.query },
      {
        headers: { 'Content-Type': 'application/json', Authorization: 'malformed token' },
      },
    );
    const responseData = response.data.errors[0];
    expect(responseData).to.have.all.keys('message', 'extensions');
    expect(responseData.message).to.equal('INVALID_SESSION_TOKEN: Error invalid or expired token');
    expect(responseData.extensions.additionalInfo.name).to.equal('JsonWebTokenError');
    expect(responseData.extensions.additionalInfo.message).to.equal('jwt malformed');
    expect(responseData.extensions.code).to.equal('401');
  });
});
