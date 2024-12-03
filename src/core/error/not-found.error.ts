import { CustomError } from './custom-error.error';
import { ErrorType } from './error.type';

export class NotFoundError<T = any> extends CustomError {
  constructor(message: string, additionalInfo?: T) {
    super(ErrorType.NotFoundError, message, additionalInfo);
  }
}
