import { expect } from 'chai';
import { describe, it } from 'mocha';
import { prisma } from '@test/test-server.ts/server-setup.test';
import { axiosPost } from '@test/utils/request-maker';
import { userMutation } from '@test/queries';
import { CreateUserVariable } from '@test/model';

const variables = {
  createUserInput: {
    name: 'usuario',
    email: 'usuario@example.com',
    password: '45687a',
    birthDate: '2003-01-01',
  },
};

describe('User Mutation Test', function () {
  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  it('should create a user using axios request', async () => {
    const response = await axiosPost<CreateUserVariable>(userMutation.query, variables);

    const userInBank = await prisma.user.findUnique({
      where: {
        email: 'usuario@example.com',
      },
    });

    expect(userInBank?.email).to.equal('usuario@example.com');
    const createdUser = response.data.data.createUser;
    expect(createdUser).to.have.property('id');
    expect(createdUser.name).to.equal('usuario');
    expect(createdUser.email).to.equal('usuario@example.com');
    expect(createdUser.birthDate).to.equal('2003-01-01');
  });

  it('should return errors while trying to create a user with a already taken email', async () => {
    await prisma.user.create({
      data: {
        name: 'usuario',
        email: 'usuario@example.com',
        password: '45687a',
        birthDate: '2003-01-01',
      },
    });

    const response = await axiosPost<CreateUserVariable>(userMutation.query, variables);

    const responseData = response.data.errors[0];
    expect(responseData.message).to.equal('Registration Failed: the providen email is already taken!');
    expect(responseData.code).to.equal(409);
    expect(responseData.additionalInfo).to.equal('Please try again using another email');
  });

  it('should return errors while trying to create a user with invalid inputs', async () => {
    const wrongVariables = {
      createUserInput: {
        name: 'usuario',
        email: 'usuarioexample',
        password: '21',
        birthDate: '20',
      },
    };

    const response = await axiosPost<CreateUserVariable>(userMutation.query, wrongVariables);
    expect(response.data).to.have.property('errors');
    const responseData = response.data.errors[0];
    const responseExtensions = responseData.additionalInfo;

    expect(responseData.message).to.equal('BAD_USER_INPUT: Please check the input fields and try again');
    expect(responseData.code).to.equal(400);
    expect(responseExtensions).to.be.an('array');
    expect(responseExtensions[0].property).to.equal('email');
    expect(responseExtensions[0].constraints.isEmail).to.equal('Informe um email válido');
    expect(responseExtensions[1].property).to.equal('password');
    expect(responseExtensions[1].constraints.minLength).to.equal('Senha deve conter pelo menos 6 caracteres');
    expect(responseExtensions[1].constraints.matches).to.equal('A senha deve conter pelo menos 1 letra e um número');
    expect(responseExtensions[2].property).to.equal('birthDate');
    expect(responseExtensions[2].constraints.isIso8601).to.equal(
      'Informe uma data válida seguindo o formato 0000-00-00',
    );
  });
});
