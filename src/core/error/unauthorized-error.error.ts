import { CustomError } from './custom-error.error';
import { ErrorType } from './error.type';

export class UnauthorizedError<T = any> extends CustomError {
  constructor(message: string, additionalInfo?: T) {
    super(ErrorType.UnauthorizedError, message, additionalInfo);
  }
}
