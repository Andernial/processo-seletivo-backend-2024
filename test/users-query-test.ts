import axios from 'axios';
import { prisma, serverUrl } from './server-setup-test.js';
import jwt from 'jsonwebtoken';
import { expect } from 'chai';

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
    await prisma.user.deleteMany();
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

  it('should sucessifully return users if a valid token is sent', async () => {
    const response = await axios.post(
      serverUrl,
      { query: query.query },
      {
        headers: { 'Content-Type': 'application/json', Authorization: testToken },
      },
    );
    const responseData = response.data.data.users;
    expect(responseData).to.be.an('array');
    expect(responseData).to.have.lengthOf(3);
    expect(responseData[0]).to.have.all.keys('id', 'name', 'email', 'birthDate');
    expect(responseData[0].name).to.equal('usuario1');
  });

  it('should return error if no token is sent', async () => {
    const response = await axios.post(
      serverUrl,
      { query: query.query },
      {
        headers: { 'Content-Type': 'application/json', Authorization: null },
      },
    );
    const responseData = response.data.errors[0];
    expect(responseData.message).to.equal('ACCESS_DENIED: You need to be logged in to acess this query');
    expect(responseData.extensions.additionalInfo).to.equal('try again providing a jwt login token');
    expect(responseData.extensions.code).to.equal('401');
  });

  it('should return error if a malformed token is sent', async () => {
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
