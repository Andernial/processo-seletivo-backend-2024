import { UserQueryModel } from '@domain/model';
import { Field, ObjectType } from 'type-graphql';
import { User } from './user.type';
import { Address } from '@graphql/module/address/type/address.type';

@ObjectType({ description: 'user query response object' })
export class UserQuery implements UserQueryModel {
  @Field(() => User)
  userData: User;

  @Field(() => [Address])
  address: Address[];
}
