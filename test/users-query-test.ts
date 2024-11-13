import axios from 'axios';
import { prisma, serverUrl } from './server-setup-test.js';
import jwt from 'jsonwebtoken';
import { expect } from 'chai';
import { UserInput } from '../src/zod-schema/user-validation.js';

let testToken: string;

const query = {
  query: `query getUsers {
    users{
    id
    name
    email
    birthDate
    }
  }`,
};

describe('Users Query Test', function () {
  before(async () => {
    await prisma.user.createMany({
      data: [
        {
          name: 'usuario1',
          email: 'usuario1@example.com',
          password: '45687a',
          birthDate: '2003-01-01',
        },
        {
          name: 'usuario2',
          email: 'usuario2@example.com',
          password: '45687a',
          birthDate: '2003-01-01',
        },
        {
          name: 'usuario3',
          email: 'usuario3@example.com',
          password: '45687a',
          birthDate: '2003-01-01',
        },
      ],
    });
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
    const responseData = response.data.data.users;
    expect(responseData).to.have.lengthOf(3);
    expect(responseData).to.be.an('array');
    responseData.forEach((user: UserInput, i: number) => {
      expect(user).to.have.all.keys('id', 'name', 'email', 'birthDate');
      expect(user.name).to.equal(`usuario${i + 1}`);
      expect(user.email).to.equal(`usuario${i + 1}@example.com`);
      expect(user.birthDate).to.equal(`2003-01-01`);
    });
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
    expect(responseData.message).to.equal('INVALID_SESSION_TOKEN: Error invalid or expired token');
    expect(responseData.extensions.additionalInfo.name).to.equal('JsonWebTokenError');
    expect(responseData.extensions.additionalInfo.message).to.equal('jwt malformed');
    expect(responseData.extensions.code).to.equal('401');
  });
});
