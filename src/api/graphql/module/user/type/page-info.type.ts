import { PageInfoModel } from '@domain/model';
import { Field, ObjectType } from 'type-graphql';

@ObjectType({ description: 'page info response object' })
export class PageInfo implements PageInfoModel {
  @Field(() => Boolean)
  hasNextPage: boolean;

  @Field(() => Boolean)
  hasPreviousPage: boolean;

  @Field(() => String, { nullable: true })
  nextCursor?: string;
}
