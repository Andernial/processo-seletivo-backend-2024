import { Arg, Authorized, Ctx, Mutation, Resolver } from 'type-graphql';
import { Service } from 'typedi';
import { AddressModel } from '@domain/model';
import { CreateAddressUseCase } from '@domain/address/create-address.user-case';
import { AddressInput } from './input/address.input';
import { Address } from './type/address.type';
import { MyContext } from '@graphql/auth-middleware';

@Service()
@Resolver()
export class AddressResolver {
  constructor(private readonly createAddressUseCase: CreateAddressUseCase) {}

  @Mutation(() => Address)
  @Authorized()
  async createAddress(
    @Arg('data', () => AddressInput) input: AddressModel,
    @Ctx() ctx: MyContext,
  ): Promise<AddressModel> {
    input.userId = ctx.userId;
    return await this.createAddressUseCase.exec(input);
  }
}
