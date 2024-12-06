import { dbClient } from '@data/db/config/db-client';
import { AddressInputModel, AddressModel } from '@domain/model';
import { Service } from 'typedi';

@Service()
export class AddressDbDataSource {
  insert(data: AddressModel): Promise<AddressModel> {
    return dbClient.address.create({ data });
  }

  async insertMany(addressInput: AddressInputModel[], userId: number[]): Promise<AddressModel[]> {
    const data = addressInput.map((address: AddressInputModel, index: number) => ({
      ...address,
      userId: userId[index],
    }));

    return await dbClient.address.createManyAndReturn({ data });
  }
}
