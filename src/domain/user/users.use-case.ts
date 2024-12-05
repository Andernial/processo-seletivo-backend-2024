import { UserDbDataSource } from '@data/user/user.db.datasource';
import { UsersInputModel } from '@domain/model';
import { Service } from 'typedi';

@Service()
export class UsersUseCase {
  constructor(private readonly dbDataSource: UserDbDataSource) {}

  exec(input: UsersInputModel) {
    return this.dbDataSource.findAll(input);
  }
}
