import { Address } from '@prisma/client';
import { AddressInput } from '../zod-schema/address-validation.js';
import { prisma } from '../../prisma/prisma-client.js';
import { GraphQLError } from 'graphql';
import { AddressValidationSchema } from '../zod-schema/address-validation.js';

export class AddressService {
  async createAddressService(params: AddressInput): Promise<Address> {
    const { cep, street, streetNumber, complement, neighborhood, city, state, userId } = params;

    const validation = AddressValidationSchema.safeParse(params);

    if (!validation.success) {
      const zoderrors = validation.error.errors.map((error) => ({
        path: error.path.join('.'),
        message: error.message,
        options: error.code == 'invalid_enum_value' ? error.options : undefined,
      }));

      throw new GraphQLError('BAD_ADDRESS_INPUT: Please check the input fields and try again', {
        extensions: {
          code: '400',
          additionalInfo: zoderrors,
        },
      });
    }

    const userExists = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!userExists) {
      throw new GraphQLError('USER_NOT_FOUND: Could not find a user with the current id', {
        extensions: {
          code: '404',
          additionalInfo: 'Try again with a valid login',
        },
      });
    }

    const newAddress = await prisma.address.create({
      data: { cep, street, streetNumber, complement, neighborhood, city, state, userId },
    });

    return newAddress;
  }
}
