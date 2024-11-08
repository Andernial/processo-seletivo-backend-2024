import { expect } from 'chai';
import { describe, it } from 'mocha';

import { prisma } from './server-setup-test.js';

describe('database test', function () {
  it('should create a user in the bank and find it', async () => {
    before(async () => {
      await prisma.user.deleteMany();
    });
    await prisma.user.create({
      data: {
        name: 'usuario',
        email: 'usuario@example.com',
        password: '45687a',
        birthDate: '2003-01-01',
      },
    });

    const userInBank = await prisma.user.findFirst({
      where: {
        email: 'usuario@example.com',
      },
    });
    expect(userInBank?.email).to.equal('usuario@example.com');
  });
});
