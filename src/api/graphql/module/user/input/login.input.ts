import { LoginInputModel } from '@domain/model';
import { Field, InputType } from 'type-graphql';

@InputType({ description: 'Infos to login' })
export class LoginInput implements LoginInputModel {
  @Field(() => String)
  email: string;

  @Field(() => String)
  password: string;

  @Field(() => Boolean, { nullable: true })
  rememberMe?: boolean;
}
