import { expect } from 'chai';
import { describe, it } from 'mocha';

import { prisma } from './server-setup-test.js';

describe('database test', function () {
  after(async () => {
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
});
