import { GraphQLFormattedError } from 'graphql';
import { ApolloServerErrorCode, unwrapResolverError } from '@apollo/server/errors';
import { CustomError, ErrorType } from '@core/error';
import { ValidationError } from 'class-validator';

function parseValidationErrors(errors: ValidationError[]) {
  return errors.map((validationError) => ({
    property: validationError.property,
    constraints: validationError.constraints,
  }));
}

export function customFormatErrors(formatedError: GraphQLFormattedError, error: unknown) {
  const unwrapedError = unwrapResolverError(error);

  if (unwrapedError instanceof CustomError) {
    return {
      message: unwrapedError.message,
      code: unwrapedError.code,
      additionalInfo: unwrapedError?.additionalInfo,
    };
  }

  if (formatedError.extensions?.code === ApolloServerErrorCode.BAD_USER_INPUT) {
    const validationErrors = formatedError.extensions?.validationErrors;
    if (!validationErrors) {
      return {
        message: formatedError.message,
        additionalInfo: formatedError.extensions,
      };
    }
    return {
      message: 'BAD_USER_INPUT: Please check the input fields and try again',
      code: ErrorType.InvalidDataError,
      additionalInfo: parseValidationErrors(validationErrors as ValidationError[]),
    };
  }

  return formatedError;
}
