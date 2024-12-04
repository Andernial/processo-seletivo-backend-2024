import { AlreadyExistsError } from '@core/error';
import { hashPassword } from '@core/security/crypto/crypto';
import { UserDbDataSource } from '@data/user/user.db.datasource';
import { UserInputModel, UserModel } from '@domain/model';
import { Service } from 'typedi';

@Service()
export class CreateUserUseCase {
  constructor(private readonly dbDataSource: UserDbDataSource) {}

  async exec(input: UserInputModel): Promise<UserModel> {
    const userAlreadyExist = await this.dbDataSource.findOneByEmail(input.email);

    if (userAlreadyExist) {
      throw new AlreadyExistsError(
        'Registration Failed: the providen email is already taken!',
        'Please try again using another email',
      );
    }

    const hashedPassword = await hashPassword(input.password);

    const user = await this.dbDataSource.insert({ ...input, password: hashedPassword });

    return user;
  }
}
