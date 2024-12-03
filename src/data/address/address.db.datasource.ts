import { dbClient } from '@data/db/config/db-client';
import { AddressModel } from '@domain/model';
import { Service } from 'typedi';

@Service()
export class AddressDbDataSource {
  async insert(data: AddressModel): Promise<AddressModel> {
    return await dbClient.address.create({ data });
  }
}
