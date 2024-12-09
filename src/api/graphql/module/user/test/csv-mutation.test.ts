import fs from 'node:fs';
import { describe, it } from 'mocha';
import { prisma } from '@test/test-server.ts/server-setup.test';
import { axiosPost } from '@test/utils';
import { csvMutation } from '@test/queries';
import { appendFormData } from '@test/utils/append-form';
import { expect } from 'chai';

describe('Csv Mutation Test', function () {
  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  it('should sucessfuly create users via a csv upload', async () => {
    const file = fs.createReadStream('./src/test/csv/csv-data.csv', 'utf-8');

    const formData = appendFormData(file, csvMutation.query);

    const response = await axiosPost({ query: csvMutation.query, formData });

    const createdUsers = await prisma.user.findMany();

    const responseData = response.data.data;
    expect(createdUsers).length(3);
    expect(responseData.csvUpload).to.equal('Upload realizado com sucesso! Usuários adicionados no banco de dados');
  });

  it('should return errors when trying to create user with already existing emails', async () => {
    await prisma.user.create({
      data: {
        name: 'user',
        password: 'genericpassword',
        birthDate: '2000-01-02',
        email: 'joao.silva@email.com',
      },
    });

    const file = fs.createReadStream('./src/test/csv/csv-data.csv', 'utf-8');

    const formData = appendFormData(file, csvMutation.query);

    const response = await axiosPost({ query: csvMutation.query, formData });

    const createdUsers = await prisma.user.findMany();

    const responseData = response.data.errors[0];

    expect(createdUsers).length(1);
    expect(responseData.message).to.equal('Registration Failed: one of the providen emails is already taken!');
    expect(responseData.code).to.equal(409);
  });

  it('should return errors when trying to upload csv with invalid inputs', async () => {
    const file = fs.createReadStream('./src/test/csv/csv-invalid-inputs.csv', 'utf-8');

    const formData = appendFormData(file, csvMutation.query);

    const response = await axiosPost({ query: csvMutation.query, formData });

    const createdUsers = await prisma.user.findMany();

    const responseData = response.data.errors[0];
    const additionalInfo = responseData.additionalInfo;

    expect(createdUsers).length(0);
    expect(responseData.message).to.equal('INVALID_DATA: Invalid fields on the file!');
    expect(responseData.code).to.equal(400);
    expect(additionalInfo[0].user).to.equal('User1');
    expect(additionalInfo[0].property).to.equal('email');
    expect(additionalInfo[0].constraints.isEmail).to.equal('Informe um email válido');
    expect(additionalInfo[1].user).to.equal('User2');
    expect(additionalInfo[1].property).to.equal('cep');
    expect(additionalInfo[1].constraints.isLength).to.equal('O cep deve conter 8 dígitos e seguir o formato 00000-000');
    expect(additionalInfo[2].user).to.equal('User3');
    expect(additionalInfo[2].property).to.equal('city');
    expect(additionalInfo[2].constraints.isNotEmpty).to.equal('O campo cidade não pode ser vazio');
  });

  it('should return errors when trying to upload a file with an invalid extension', async () => {
    const file = fs.createReadStream('./src/test/csv/invalid-file', 'utf-8');

    const formData = appendFormData(file, csvMutation.query);

    const response = await axiosPost({ query: csvMutation.query, formData });

    const createdUsers = await prisma.user.findMany();

    const responseData = response.data.errors[0];
    expect(createdUsers).length(0);
    expect(responseData.message).to.equal('INVALID_DATA: The file must contain an extension .csv or .txt');
    expect(responseData.code).to.equal(400);
  });

  it('should return errors when trying to upload csv with no data', async () => {
    const file = fs.createReadStream('./src/test/csv/csv-no-data.csv', 'utf-8');

    const formData = appendFormData(file, csvMutation.query);

    const response = await axiosPost({ query: csvMutation.query, formData });

    const createdUsers = await prisma.user.findMany();

    const responseData = response.data.errors[0];
    expect(createdUsers).length(0);
    expect(responseData.message).to.equal('INVALID_DATA: The file must contain the data of at least one user!');
    expect(responseData.code).to.equal(400);
  });
});
