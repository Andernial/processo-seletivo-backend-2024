import jwt from 'jsonwebtoken';
import { prisma } from '@test/test-server.ts/server-setup.test';
import { expect } from 'chai';
import { generateFakeUsers } from '@data/db/seed/seed';
import { User } from '@prisma/client';
import { base64Encode } from '@core/utils/encoder-utils';
import { UserQueryModel } from '@domain/model/user.model';
import { axiosPost } from '@test/utils';
import { usersQuery } from '@test/queries';
import { UsersVariable } from '@test/model';

let testToken: string;

describe('Users Query Test', function () {
  before(async () => {
    const data = generateFakeUsers(30);
    const testUsers = await prisma.user.createManyAndReturn({ data });
    const manyAddress = testUsers.map((user: User, i: number) => ({
      cep: '12345-678',
      city: 'São Paulo',
      neighborhood: 'Vila Mariana',
      state: 'São Paulo',
      street: 'Rua dos Três Irmãos',
      streetNumber: `${i}`,
      userId: user.id,
    }));

    await prisma.address.createMany({
      data: manyAddress,
    });

    testToken = jwt.sign({ id: 1 }, process.env.SECRET_KEY ?? '', { expiresIn: '1h' });
  });

  after(async () => {
    await prisma.user.deleteMany();
  });

  it('should successfully return users if a valid token is sent', async () => {
    const response = await axiosPost(usersQuery.query, undefined, testToken);

    const testUsers = await prisma.user.findMany({
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      include: {
        address: true,
      },
      take: 10,
    });

    const lastUserInQuery = testUsers[testUsers.length - 1];
    const encodedCursor = base64Encode({ name: lastUserInQuery.name, id: lastUserInQuery.id });
    const responseUsersData = response.data.data.users.usersData;
    const responsePageInfo = response.data.data.users.pageInfo;

    expect(responseUsersData).to.have.length(10);
    expect(responseUsersData[0]).to.have.all.keys('address', 'userData');
    responseUsersData.forEach((user: UserQueryModel, i: number) => {
      const userData = user.userData;
      const address = user.address;
      const testAddress = testUsers[i].address[0];
      expect(address[0]).to.have.all.keys(
        'id',
        'cep',
        'city',
        'complement',
        'neighborhood',
        'state',
        'street',
        'streetNumber',
        'userId',
      );

      expect(address[0].cep).to.equal(testAddress.cep);
      expect(address[0].city).to.equal(testAddress.city);
      expect(address[0].complement).to.equal(testAddress.complement);
      expect(address[0].neighborhood).to.equal(testAddress.neighborhood);
      expect(address[0].state).to.equal(testAddress.state);
      expect(address[0].street).to.equal(testAddress.street);
      expect(address[0].streetNumber).to.equal(testAddress.streetNumber);
      expect(address[0].userId).to.equal(testAddress.userId);

      expect(userData).to.have.all.keys('id', 'name', 'email', 'birthDate');
      expect(userData.name).to.equal(testUsers[i].name);
      expect(userData.email).to.equal(testUsers[i].email);
      expect(userData.birthDate).to.equal(testUsers[i].birthDate);
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

    const response = await axiosPost<UsersVariable>(usersQuery.query, variables, testToken);

    const testUsers = await prisma.user.findMany({
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      take: 3,
      skip: 1,
      cursor: { name_id: { name: lastUserInQuery.name, id: lastUserInQuery.id } },
      include: {
        address: true,
      },
    });

    const lastUserInQuery2 = testUsers[testUsers.length - 1];
    const encodedCursor2 = base64Encode({ name: lastUserInQuery2.name, id: lastUserInQuery2.id });
    const responseUsersData = response.data.data.users.usersData;
    const responsePageInfo = response.data.data.users.pageInfo;

    responseUsersData.forEach((user: UserQueryModel, i: number) => {
      const userData = user.userData;
      const address = user.address;
      const testAddress = testUsers[i].address[0];

      expect(address[0]).to.have.all.keys(
        'id',
        'cep',
        'city',
        'complement',
        'neighborhood',
        'state',
        'street',
        'streetNumber',
        'userId',
      );

      expect(address[0].cep).to.equal(testAddress.cep);
      expect(address[0].city).to.equal(testAddress.city);
      expect(address[0].complement).to.equal(testAddress.complement);
      expect(address[0].neighborhood).to.equal(testAddress.neighborhood);
      expect(address[0].state).to.equal(testAddress.state);
      expect(address[0].street).to.equal(testAddress.street);
      expect(address[0].streetNumber).to.equal(testAddress.streetNumber);
      expect(address[0].userId).to.equal(testAddress.userId);

      expect(userData).to.have.all.keys('id', 'name', 'email', 'birthDate');
      expect(userData.name).to.equal(testUsers[i].name);
      expect(userData.email).to.equal(testUsers[i].email);
      expect(userData.birthDate).to.equal(testUsers[i].birthDate);
    });
    expect(responsePageInfo).to.have.keys('hasNextPage', 'hasPreviousPage', 'nextCursor');
    expect(responsePageInfo.hasNextPage).to.equal(true);
    expect(responsePageInfo.hasPreviousPage).to.equal(true);
    expect(encodedCursor2).to.be.an('string');
    expect(responsePageInfo.nextCursor).to.equal(encodedCursor2);
    expect(response.data.data.users.usersTotal).to.equal(30);
  });

  it('should return the default quantity of users with empty address and show theres no more pages', async () => {
    await prisma.address.deleteMany();
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

    const response = await axiosPost<UsersVariable>(usersQuery.query, variables, testToken);

    const testUsers = await prisma.user.findMany({
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      take: 10,
      skip: 20,
      include: {
        address: true,
      },
    });

    const responseUsersData = response.data.data.users.usersData;
    const responsePageInfo = response.data.data.users.pageInfo;

    responseUsersData.forEach((user: UserQueryModel, i: number) => {
      const userData = user.userData;
      const testAddress = testUsers[i].address;

      expect(testAddress).to.have.length(0);
      expect(userData).to.have.all.keys('id', 'name', 'email', 'birthDate');
      expect(userData.name).to.equal(testUsers[i].name);
      expect(userData.email).to.equal(testUsers[i].email);
      expect(userData.birthDate).to.equal(testUsers[i].birthDate);
    });
    expect(responsePageInfo).to.have.keys('hasNextPage', 'hasPreviousPage', 'nextCursor');
    expect(responsePageInfo.hasNextPage).to.equal(false);
    expect(responsePageInfo.hasPreviousPage).to.equal(true);
    expect(responsePageInfo.nextCursor).to.equal(null);
    expect(response.data.data.users.usersTotal).to.equal(30);
  });

  it('should return the an empty array of users if no users are found', async () => {
    await prisma.user.deleteMany();

    const response = await axiosPost(usersQuery.query, undefined, testToken);

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

    const response = await axiosPost<UsersVariable>(usersQuery.query, variables, testToken);

    const responseData = response.data.errors[0];
    expect(responseData).to.have.all.keys('message', 'code', 'additionalInfo');
    expect(responseData.message).to.equal('INVALID_CURSOR: Invalid or malformed cursor string');
    expect(responseData.additionalInfo).to.equal('Please provide a valid cursor string');
    expect(responseData.code).to.equal(400);
  });

  it('should return an error if no token is provided', async () => {
    const response = await axiosPost(usersQuery.query, undefined);

    const responseData = response.data.errors[0];

    expect(responseData).to.have.all.keys('message', 'code');
    expect(responseData.message).to.equal('ACCESS_DENIED: You need to be logged in to access this query');
    expect(responseData.code).to.equal(401);
  });

  it('should return an error if a malformed token is provided', async () => {
    const response = await axiosPost(usersQuery.query, undefined, 'malformed token');
    const responseData = response.data.errors[0];
    expect(responseData).to.have.all.keys('message', 'code', 'additionalInfo');
    expect(responseData.message).to.equal('INVALID_SESSION_TOKEN: Error invalid or expired token');
    expect(responseData.additionalInfo.name).to.equal('JsonWebTokenError');
    expect(responseData.additionalInfo.message).to.equal('jwt malformed');
    expect(responseData.code).to.equal(401);
  });
});
