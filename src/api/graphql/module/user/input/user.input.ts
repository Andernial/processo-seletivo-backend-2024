import { UserInputModel } from '@domain/model';
import { IsEmail, IsISO8601, Matches, MaxLength, MinLength } from 'class-validator';
import { Field, InputType } from 'type-graphql';

@InputType({ description: 'Infos to create user' })
export class UserInput implements UserInputModel {
  @Field(() => String, { description: 'User name' })
  @MinLength(4, { message: 'Nome deve conter ao menos 4 caracteres' })
  name: string;

  @Field(() => String, { description: 'User email' })
  @IsEmail(undefined, { message: 'Informe um email válido' })
  email: string;

  @Field(() => String, { description: 'User password' })
  @MinLength(6, { message: 'Senha deve conter pelo menos 6 caracteres' })
  @MaxLength(255, { message: 'Senha deve conter ao máximo menos 255 caracteres' })
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d).+$/, { message: 'A senha deve conter pelo menos 1 letra e um número' })
  password: string;

  @Field(() => String, { description: 'User birhDate' })
  @IsISO8601(undefined, { message: 'Informe uma data válida seguindo o formato 0000-00-00' })
  birthDate: string;
}
