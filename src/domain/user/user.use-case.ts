import { NotFoundError } from '@core/error';
import { UserDbDataSource } from '@data/user/user.db.datasource';
import { UserQueryModel } from '@domain/model';
import { Service } from 'typedi';

@Service()
export class UserUseCase {
  constructor(private readonly dbDataSource: UserDbDataSource) {}

  async exec(id: number): Promise<UserQueryModel> {
    const user = await this.dbDataSource.findById(id);

    if (!user) {
      throw new NotFoundError(
        'USER_NOT_FOUND: Could not find user with the provided id!',
        'Please try again using a different id',
      );
    }

    const userInfo = {
      userData: {
        id: user.id,
        name: user.name,
        email: user.email,
        birthDate: user.birthDate,
      },
      address: user.address,
    };

    return userInfo;
  }
}
