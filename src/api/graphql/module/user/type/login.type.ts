import { Field, ObjectType } from 'type-graphql';
import { LoginModel } from '@domain/model';
import { User } from './user.type';

@ObjectType({ description: 'login mutation response object' })
export class Login implements LoginModel {
  @Field(() => User)
  user: User;

  @Field()
  token: string;
}
