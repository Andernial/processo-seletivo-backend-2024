import { UsersQueryModel } from '@domain/model';
import { Field, Int, ObjectType } from 'type-graphql';
import { UserQuery } from './user-query.type';
import { PageInfo } from './page-info.type';

@ObjectType({ description: 'users query response object' })
export class UsersQuery implements UsersQueryModel {
  @Field(() => [UserQuery])
  usersData: UserQuery[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;

  @Field(() => Int)
  usersTotal: number;
}
