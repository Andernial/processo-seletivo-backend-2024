import { generateToken } from '@core/security/jwt/jwt';
import { verifyPassword } from '@core/security/crypto/crypto';
import { UserDbDataSource } from '@data/user/user.db.datasource';
import { LoginInputModel, LoginModel } from '@domain/model';
import { Service } from 'typedi';
import { NotFoundError } from '@core/error';

@Service()
export class LoginUseCase {
  constructor(private readonly dbDataSource: UserDbDataSource) {}

  async exec(input: LoginInputModel): Promise<LoginModel> {
    const user = await this.dbDataSource.findOneByEmail(input.email);

    if (!user) {
      throw new NotFoundError(
        'USER_NOT_FOUND: Could not find a user with that email or password',
        'Please verify email or password and try again',
      );
    }

    const verify = await verifyPassword(input.password, user.password);

    if (!verify) {
      throw new NotFoundError(
        'USER_NOT_FOUND: Could not find a user with that email or password',
        'Please verify email or password and try again',
      );
    }

    const token = generateToken(user.id, input.rememberMe);

    const loginReturn = {
      user,
      token,
    };

    return loginReturn;
  }
}
