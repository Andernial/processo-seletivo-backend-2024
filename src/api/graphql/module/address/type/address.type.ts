import { Field, ObjectType } from 'type-graphql';
import { AddressModel } from '@domain/model';

@ObjectType({ description: 'The address model' })
export class Address implements AddressModel {
  @Field(() => Number, { description: 'Adress id' })
  id: number;

  @Field({ description: 'Address cep' })
  cep: string;

  @Field({ description: 'Address street' })
  street: string;

  @Field({ description: 'Address streetNumber' })
  streetNumber: string;

  @Field({ nullable: true, description: 'Address complement' })
  complement: string;

  @Field({ description: 'Address neighborhood' })
  neighborhood: string;

  @Field({ description: 'Address city' })
  city: string;

  @Field({ description: 'Address birthdate' })
  state: string;

  @Field({ description: 'Address userId' })
  userId: number;
}
