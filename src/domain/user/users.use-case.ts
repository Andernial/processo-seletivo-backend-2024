import { UserDbDataSource } from '@data/user/user.db.datasource';
import { UsersInputModel } from '@domain/model';
import { Service } from 'typedi';

@Service()
export class UsersUseCase {
  constructor(private readonly dbDataSource: UserDbDataSource) {}

  async exec(input: UsersInputModel) {
    return await this.dbDataSource.findAll(input);
  }
}
