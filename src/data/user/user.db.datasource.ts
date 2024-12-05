import { base64Encode, decodeObject } from '@core/utils';
import { dbClient } from '@data/db/config/db-client';
import {
  UserAddressModel,
  UserInputModel,
  UserModel,
  UserModelWithPassword,
  UserQueryModel,
  UsersInputModel,
  UsersQueryModel,
} from '@domain/model';
import { Service } from 'typedi';

@Service()
export class UserDbDataSource {
  async insert(data: UserInputModel): Promise<UserModel> {
    return await dbClient.user.create({ data });
  }

  findOneByEmail(email: string): Promise<UserModelWithPassword> {
    return dbClient.user.findUnique({ where: { email } });
  }

  findById(id: number): Promise<UserAddressModel> {
    return dbClient.user.findUnique({ where: { id }, include: { address: true } });
  }

  async findAll(input: UsersInputModel): Promise<UsersQueryModel> {
    const quantity = input?.quantity ? input.quantity : 10;
    const cursor = input?.cursor ? input.cursor : null;
    const decodedString = cursor ? decodeObject(cursor) : null;

    const usersTotal = await dbClient.user.count();
    const users = await dbClient.user.findMany({
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      take: quantity,
      skip: cursor ? 1 : undefined,
      cursor: decodedString ? { name_id: { name: decodedString.name, id: decodedString.id } } : undefined,
      include: {
        address: true,
      },
    });

    if (users.length === 0) {
      const data: UsersQueryModel = {
        usersData: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          nextCursor: undefined,
        },
        usersTotal,
      };

      return data;
    }

    const lastUserInQuery = users[users.length - 1];
    const encodedNewCursor = base64Encode({ name: lastUserInQuery.name, id: lastUserInQuery.id });

    const nextPage = await dbClient.user.count({
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      skip: 1,
      cursor: { name_id: { name: lastUserInQuery.name, id: lastUserInQuery.id } },
    });

    const arrayWithUsers: UserQueryModel[] = users.map((user) => ({
      userData: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        birthDate: user.birthDate,
      },
      address: user.address,
    }));

    const hasNextPage = nextPage > 0 ? true : false;

    const data = {
      usersData: arrayWithUsers,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: cursor ? true : false,
        nextCursor: hasNextPage ? encodedNewCursor : undefined,
      },
      usersTotal,
    };

    return data;
  }
}
