import { NotFoundError } from '@core/error';
import { AddressDbDataSource } from '@data/address/address.db.datasource';
import { UserDbDataSource } from '@data/user/user.db.datasource';
import { AddressModel } from '@domain/model';
import { Service } from 'typedi';

@Service()
export class CreateAddressUseCase {
  constructor(
    private readonly userDbDataSource: UserDbDataSource,
    private readonly addressDbDataSource: AddressDbDataSource,
  ) {}

  async exec(input: AddressModel): Promise<AddressModel> {
    const userExists = await this.userDbDataSource.findById(input.userId);

    if (!userExists) {
      throw new NotFoundError(
        'USER_NOT_FOUND: Could not find a user with the current id',
        'Try again with a valid login',
      );
    }

    return await this.addressDbDataSource.insert(input);
  }
}
