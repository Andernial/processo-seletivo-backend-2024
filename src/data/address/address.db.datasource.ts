import { dbClient } from '@data/db/config/db-client';
import { AddressModel } from '@domain/model';
import { Service } from 'typedi';

@Service()
export class AddressDbDataSource {
  insert(data: AddressModel): Promise<AddressModel> {
    return dbClient.address.create({ data });
  }
}
