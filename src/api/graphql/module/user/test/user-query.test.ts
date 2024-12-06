import { prisma } from '@test/test-server.ts/server-setup.test';
import { describe, it } from 'mocha';
import jwt from 'jsonwebtoken';
import { expect } from 'chai';
import { Address, User } from '@prisma/client';
import { userQuery } from '@test/queries';
import { axiosPost } from '@test/utils/request-maker';
import { UserVariable } from '@test/model';

let testToken: string;
let testUser: User;
let testAddress: Address;

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

    testUser = newUser;

    const newAddress = await prisma.address.create({
      data: {
        cep: '12345-678',
        city: 'São Paulo',
        neighborhood: 'Vila Mariana',
        state: 'São Paulo',
        street: 'Rua dos Três Irmãos',
        streetNumber: '123',
        userId: testUser.id,
      },
    });
    testAddress = newAddress;
    testToken = jwt.sign({ id: testUser.id }, process.env.SECRET_KEY ?? '', { expiresIn: '1h' });
  });

  after(async () => {
    await prisma.user.deleteMany();
    await prisma.address.deleteMany();
  });

  it('should return a user and address if a correct user id and token are provided', async () => {
    const variables = {
      userId: testUser.id,
    };
    const response = await axiosPost<UserVariable>(userQuery.query, variables, testToken);
    const responseUser = response.data.data.user.userData;
    const responseAddress = response.data.data.user.address[0];
    expect(responseUser).to.have.all.keys('name', 'email', 'birthDate', 'id');
    expect(responseUser).to.have.property('id');
    expect(responseUser.id).to.equal(testUser.id);
    expect(responseUser.name).to.equal(testUser.name);
    expect(responseUser.email).to.equal(testUser.email);
    expect(responseUser.birthDate).to.equal(testUser.birthDate);

    expect(responseAddress).to.have.all.keys(
      'id',
      'cep',
      'street',
      'streetNumber',
      'complement',
      'neighborhood',
      'city',
      'userId',
      'state',
    );
    expect(responseAddress.cep).to.equal(testAddress.cep);
    expect(responseAddress.street).to.equal(testAddress.street);
    expect(responseAddress.streetNumber).to.equal(testAddress.streetNumber);
    expect(responseAddress.complement).to.equal(testAddress.complement);
    expect(responseAddress.neighborhood).to.equal(testAddress.neighborhood);
    expect(responseAddress.city).to.equal(testAddress.city);
    expect(responseAddress.userId).to.equal(testAddress.userId);
    expect(responseAddress.state).to.equal(testAddress.state);
  });

  it('should return a user and empty address if a correct user id and token are provided', async () => {
    await prisma.address.deleteMany();
    const variables = {
      userId: testUser.id,
    };
    const response = await axiosPost<UserVariable>(userQuery.query, variables, testToken);

    const responseUser = response.data.data.user.userData;
    const responseAddress = response.data.data.user.address;
    expect(responseUser).to.have.all.keys('name', 'email', 'birthDate', 'id');
    expect(responseUser).to.have.property('id');
    expect(responseUser.id).to.equal(testUser.id);
    expect(responseUser.name).to.equal(testUser.name);
    expect(responseUser.email).to.equal(testUser.email);
    expect(responseUser.birthDate).to.equal(testUser.birthDate);

    expect(responseAddress).length(0);
  });

  it('should return an error if an incorrect user id is provided', async () => {
    const variables = {
      userId: 90000,
    };

    const response = await axiosPost<UserVariable>(userQuery.query, variables, testToken);

    const responseData = response.data.errors[0];
    expect(responseData.message).to.equal('USER_NOT_FOUND: Could not find user with the provided id!');
    expect(responseData.additionalInfo).to.equal('Please try again using a different id');
    expect(responseData.code).to.equal(404);
  });

  it('should return an error if no token is provided', async () => {
    const variables = {
      userId: testUser.id,
    };

    const response = await axiosPost(userQuery.query, variables);

    const responseData = response.data.errors[0];
    expect(responseData.message).to.equal('ACCESS_DENIED: You need to be logged in to access this query');
    expect(responseData.code).to.equal(401);
  });

  it('should return an error if a malformed token is provided', async () => {
    const variables = {
      userId: testUser.id,
    };

    const response = await axiosPost<UserVariable>(userQuery.query, variables, 'wrong token');

    const responseData = response.data.errors[0];
    expect(responseData.message).to.equal('INVALID_SESSION_TOKEN: Error invalid or expired token');
    expect(responseData.additionalInfo.name).to.equal('JsonWebTokenError');
    expect(responseData.additionalInfo.message).to.equal('jwt malformed');
    expect(responseData.code).to.equal(401);
  });
});
