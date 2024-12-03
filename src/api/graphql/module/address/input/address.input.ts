import { Field, InputType } from 'type-graphql';
import { AddressInputModel, estados } from '@domain/model';
import { IsEnum, IsOptional, Length, IsNotEmpty, MaxLength } from 'class-validator';

@InputType({ description: 'Infos to create the address' })
export class AddressInput implements AddressInputModel {
  @Field({ description: 'Address cep' })
  @Length(9, 9, { message: 'O cep deve conter 8 dígitos e seguir o formato 00000-000' })
  cep: string;

  @Field({ description: 'Address street' })
  @IsNotEmpty({ message: 'O nome da rua não pode ser vazio' })
  @MaxLength(255, { message: 'O nome da rua deve conter no máximo 255 caracteres' })
  street: string;

  @Field({ description: 'Address streetNumber' })
  @IsNotEmpty({ message: 'O número não pode ser vazio' })
  @MaxLength(10, { message: 'O número da rua deve conter no máximo 10 caracteres' })
  streetNumber: string;

  @Field({ nullable: true, description: 'Address complement' })
  @IsOptional()
  @MaxLength(60, { message: 'O complemento deve conter no máximo 60 caracteres' })
  complement?: string;

  @Field({ description: 'Address neighborhood' })
  @IsNotEmpty({ message: 'O bairro não pode ser vazio' })
  @MaxLength(255, { message: 'O bairro deve conter no máximo 255 caracteres' })
  neighborhood: string;

  @Field({ description: 'Address city' })
  @IsNotEmpty({ message: 'O campo cidade não pode ser vazio' })
  @MaxLength(255, { message: 'A cidade deve conter no máximo 255 caracteres' })
  city: string;

  @Field({ description: 'Address state' })
  @IsEnum(estados, { message: `Selecione um dos estados do Brasil! opções: ${Object.values(estados).join(' | ')}` })
  state: string;
}
