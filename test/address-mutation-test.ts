import axios from 'axios';
import jwt from 'jsonwebtoken';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { serverUrl } from './server-setup-test.js';
import { prisma } from './server-setup-test.js';

let fakeToken: string;

const mutation = {
  query: `mutation CreateAddress($createAddressInput: AddressInput!) {
  createAddress(input: $createAddressInput) {
    cep
    city
    complement
    id
    neighborhood
    state
    street
    streetNumber
    userId
  }
}`,
};

const variables = {
  createAddressInput: {
    cep: '12345-678',
    city: 'São Paulo',
    complement: null,
    neighborhood: 'Vila Mariana',
    state: 'São Paulo',
    street: 'Rua dos Três Irmãos',
    streetNumber: '123',
  },
};

describe('Address mutation test', function () {
  before(async () => {
    fakeToken = jwt.sign({ id: 1 }, process.env.SECRET_KEY ?? '', { expiresIn: '1h' });
  });

  after(async () => {
    await prisma.user.deleteMany();
  });

  it('should create an address user using axios request', async () => {
    const testUser = await prisma.user.create({
      data: {
        name: 'usuario',
        email: 'usuario@example.com',
        password: '45687a',
        birthDate: '2003-01-01',
      },
    });

    const testToken = jwt.sign({ id: testUser.id }, process.env.SECRET_KEY ?? '', { expiresIn: '1h' });
    const response = await axios.post(
      serverUrl,
      { query: mutation.query, variables: variables },
      {
        headers: { 'Content-Type': 'application/json', Authorization: testToken },
      },
    );

    const addressInBank = await prisma.address.findMany({
      where: {
        userId: testUser.id,
      },
    });

    expect(testUser?.email).to.equal('usuario@example.com');
    expect(addressInBank).to.be.an('array');
    expect(addressInBank).to.have.length(1);
    const address = response.data.data.createAddress;
    expect(address).to.have.all.keys(
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
    expect(address.cep).to.equal(addressInBank[0].cep);
    expect(address.city).to.equal(addressInBank[0].city);
    expect(address.complement).to.equal(addressInBank[0].complement);
    expect(address.neighborhood).to.equal(addressInBank[0].neighborhood);
    expect(address.state).to.equal(addressInBank[0].state);
    expect(address.street).to.equal(addressInBank[0].street);
    expect(address.streetNumber).to.equal(addressInBank[0].streetNumber);
    expect(address.userId).to.equal(testUser?.id);
  });

  it('should return errors while trying to create an address with a user that is not in the database', async () => {
    const response = await axios.post(
      serverUrl,
      { query: mutation.query, variables: variables },
      {
        headers: { 'Content-Type': 'application/json', Authorization: fakeToken },
      },
    );
    expect(response.data).to.have.property('errors');
    const responseData = response.data.errors[0];
    const responseExtensions = responseData.extensions;
    expect(responseData.message).to.equal('USER_NOT_FOUND: Could not find a user with the current id');
    expect(responseExtensions.additionalInfo).to.equal('Try again with a valid login');
    expect(responseExtensions.code).to.equal('404');
  });

  it('should return errors while trying to create an address with invalid inputs', async () => {
    const wrongVariables = {
      createAddressInput: {
        cep: 'null',
        city: '',
        complement: '',
        neighborhood: 'w',
        state: 'i',
        street: 'i',
        streetNumber: '',
      },
    };

    const response = await axios.post(
      serverUrl,
      { query: mutation.query, variables: wrongVariables },
      {
        headers: { 'Content-Type': 'application/json', Authorization: fakeToken },
      },
    );
    expect(response.data).to.have.property('errors');
    const responseData = response.data.errors[0];
    const responseExtensions = responseData.extensions;

    expect(responseData.message).to.equal('BAD_ADDRESS_INPUT: Please check the input fields and try again');
    expect(responseExtensions.code).to.equal('400');
    expect(responseExtensions.additionalInfo).to.be.an('array');
    expect(responseExtensions.additionalInfo[0].path).to.equal('cep');
    expect(responseExtensions.additionalInfo[0].message).to.equal(
      'O cep deve conter 8 digitos e seguir o formato 00000-000',
    );
    expect(responseExtensions.additionalInfo[1].path).to.equal('street');
    expect(responseExtensions.additionalInfo[1].message).to.equal('O nome da rua deve conter pelo menos 10 caracteres');
    expect(responseExtensions.additionalInfo[2].path).to.equal('streetNumber');
    expect(responseExtensions.additionalInfo[2].message).to.equal('O número deve conter pelo menos 1 caractere');
    expect(responseExtensions.additionalInfo[3].path).to.equal('complement');
    expect(responseExtensions.additionalInfo[3].message).to.equal('O complemento deve conter pelo menos 5 caracteres');
    expect(responseExtensions.additionalInfo[4].path).to.equal('neighborhood');
    expect(responseExtensions.additionalInfo[4].message).to.equal('O bairro deve conter pelo menos 4 caracteres');
    expect(responseExtensions.additionalInfo[5].path).to.equal('city');
    expect(responseExtensions.additionalInfo[5].message).to.equal('A cidade deve conter pelo menos 4 caracteres');
    expect(responseExtensions.additionalInfo[6].path).to.equal('state');
    expect(responseExtensions.additionalInfo[6].message).to.equal('Selecione um dos estados do brasil!');
    expect(responseExtensions.additionalInfo[6].options).to.have.length(27);
  });

  it('should return an error if a malformed token is provided', async () => {
    const response = await axios.post(
      serverUrl,
      { query: mutation.query, variables },
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

  it('should return an error if no token is provided', async () => {
    const response = await axios.post(
      serverUrl,
      { query: mutation.query, variables },
      {
        headers: { 'Content-Type': 'application/json', Authorization: null },
      },
    );

    const responseData = response.data.errors[0];
    expect(responseData.message).to.equal('ACCESS_DENIED: You need to be logged in to access this query');
    expect(responseData.extensions.additionalInfo).to.equal('try again providing a jwt login token');
    expect(responseData.extensions.code).to.equal('401');
  });
});
