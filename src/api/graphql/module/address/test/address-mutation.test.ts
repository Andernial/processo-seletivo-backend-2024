import jwt from 'jsonwebtoken';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { prisma } from '@test/test-server.ts/server-setup.test';
import { axiosPost } from '@test/utils/request-maker';
import { AddressVariable } from '@test/model';
import { addressMutation } from '@test/queries';
import { States } from '@domain/model';

let fakeToken: string;

const variables = {
  createAddressInput: {
    cep: '12345-678',
    city: 'São Paulo',
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

  afterEach(async () => {
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
    const response = await axiosPost<AddressVariable>(addressMutation.query, variables, testToken);

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
    const response = await axiosPost<AddressVariable>(addressMutation.query, variables, fakeToken);

    expect(response.data).to.have.property('errors');
    const responseData = response.data.errors[0];
    expect(responseData.message).to.equal('USER_NOT_FOUND: Could not find a user with the current id');
    expect(responseData.additionalInfo).to.equal('Try again with a valid login');
    expect(responseData.code).to.equal(404);
  });

  it('should return errors while trying to create an address with invalid inputs', async () => {
    const wrongVariables = {
      createAddressInput: {
        cep: 'null',
        city: '',
        neighborhood: '',
        state: 'i',
        street: '',
        streetNumber: '',
      },
    };

    const response = await axiosPost<AddressVariable>(addressMutation.query, wrongVariables, fakeToken);

    expect(response.data).to.have.property('errors');
    const responseData = response.data.errors[0];

    expect(responseData.message).to.equal('BAD_USER_INPUT: Please check the input fields and try again');
    expect(responseData.code).to.equal(400);
    expect(responseData.additionalInfo).to.be.an('array');
    expect(responseData.additionalInfo[0].property).to.equal('cep');
    expect(responseData.additionalInfo[0].constraints.isLength).to.equal(
      'O cep deve conter 8 dígitos e seguir o formato 00000-000',
    );
    expect(responseData.additionalInfo[1].property).to.equal('street');
    expect(responseData.additionalInfo[1].constraints.isNotEmpty).to.equal('O nome da rua não pode ser vazio');
    expect(responseData.additionalInfo[2].property).to.equal('streetNumber');
    expect(responseData.additionalInfo[2].constraints.isNotEmpty).to.equal('O número não pode ser vazio');
    expect(responseData.additionalInfo[3].property).to.equal('neighborhood');
    expect(responseData.additionalInfo[3].constraints.isNotEmpty).to.equal('O bairro não pode ser vazio');
    expect(responseData.additionalInfo[4].property).to.equal('city');
    expect(responseData.additionalInfo[4].constraints.isNotEmpty).to.equal('O campo cidade não pode ser vazio');
    expect(responseData.additionalInfo[5].property).to.equal('state');
    expect(responseData.additionalInfo[5].constraints.isEnum).to.equal(
      `Selecione um dos estados do Brasil! opções: ${Object.values(States).join(' | ')}`,
    );
  });

  it('should return an error if a malformed token is provided', async () => {
    const response = await axiosPost<AddressVariable>(addressMutation.query, variables, 'malformed token');
    const responseData = response.data.errors[0];
    expect(responseData.message).to.equal('INVALID_SESSION_TOKEN: Error invalid or expired token');
    expect(responseData.additionalInfo.name).to.equal('JsonWebTokenError');
    expect(responseData.additionalInfo.message).to.equal('jwt malformed');
    expect(responseData.code).to.equal(401);
  });

  it('should return an error if no token is provided', async () => {
    const response = await axiosPost<AddressVariable>(addressMutation.query, variables);

    const responseData = response.data.errors[0];

    expect(responseData.message).to.equal('ACCESS_DENIED: You need to be logged in to access this query');
    expect(responseData.code).to.equal(401);
  });
});
