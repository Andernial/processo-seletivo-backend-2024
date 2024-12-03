import { Field, Int, ObjectType } from 'type-graphql';
import { UserModel } from '@domain/model';

@ObjectType({ description: 'The user model' })
export class User implements UserModel {
  @Field(() => Int, { description: 'User id' })
  id: number;

  @Field({ description: 'User name' })
  name: string;

  @Field({ description: 'User email' })
  email: string;

  @Field({ description: 'user birthdate' })
  birthDate: string;
}
