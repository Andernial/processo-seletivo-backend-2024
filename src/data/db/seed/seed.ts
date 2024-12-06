import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
const prisma = new PrismaClient();

export function generateFakeUsers(numberOfUsers: number = 50) {
  const user = [];
  for (let i = 0; i < numberOfUsers; i++) {
    const date = faker.date.birthdate();
    const dateString = date.toISOString().split('T')[0];
    const newUser = {
      name: faker.person.firstName(),
      email: faker.internet.email(),
      password: `hashed_password`,
      birthDate: dateString,
    };
    user.push(newUser);
  }
  return user;
}

const data = generateFakeUsers();

async function seed() {
  await prisma.user.createMany({ data });
}

seed().then(() => {
  console.log('data base seeded');
  prisma.$disconnect();
});
