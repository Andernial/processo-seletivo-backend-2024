import { expect } from 'chai';
import { describe, it } from 'mocha';
import { prisma } from './test-server.ts/server-setup.test';
import { generateFakeUsers } from '@data/db/seed/seed';

describe('database test', function () {
  afterEach(async () => {
    await prisma.user.deleteMany();
  });
  it('should create an user in the bank and find it', async () => {
    await prisma.user.create({
      data: {
        name: 'usuario',
        email: 'usuario@example.com',
        password: '45687a',
        birthDate: '2003-01-01',
      },
    });

    const userInBank = await prisma.user.findUnique({
      where: {
        email: 'usuario@example.com',
      },
    });
    expect(userInBank).to.have.all.keys('id', 'name', 'email', 'birthDate', 'password');
    expect(userInBank?.email).to.equal('usuario@example.com');
    expect(userInBank?.name).to.equal('usuario');
    expect(userInBank?.email).to.equal('usuario@example.com');
    expect(userInBank?.birthDate).to.equal('2003-01-01');
    expect(userInBank?.password).to.equal('45687a');
  });

  it('should seed the database', async () => {
    const data = generateFakeUsers(10);
    const createdUsers = await prisma.user.createManyAndReturn({ data });

    expect(data).to.have.length(10);
    createdUsers.forEach((user, i) => {
      expect(user).to.have.all.keys('id', 'name', 'email', 'birthDate', 'password');
      expect(user.name).to.equal(data[i].name);
      expect(user.email).to.equal(data[i].email);
      expect(user.password).to.equal(data[i].password);
      expect(user.birthDate).to.equal(data[i].birthDate);
    });
  });
});
