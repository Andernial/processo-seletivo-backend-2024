import { CustomError } from './custom-error.error';
import { ErrorType } from './error.type';

export class InvalidDataError<T = any> extends CustomError {
  constructor(message: string, additionalInfo?: T) {
    super(ErrorType.InvalidDataError, message, additionalInfo);
  }
}
