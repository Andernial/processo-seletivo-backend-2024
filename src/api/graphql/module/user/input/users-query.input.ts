import { UsersInputModel } from '@domain/model';
import { Field, InputType, Int } from 'type-graphql';

@InputType({ description: 'Pagination Infos' })
export class PaginationInput implements UsersInputModel {
  @Field(() => Int, { nullable: true })
  quantity?: number;

  @Field(() => String, { nullable: true })
  cursor?: string;
}
