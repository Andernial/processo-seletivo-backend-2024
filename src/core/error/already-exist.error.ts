import { CustomError } from './custom-error.error';
import { ErrorType } from './error.type';

export class AlreadyExistsError<T = any> extends CustomError {
  constructor(message: string, additionalInfo?: T) {
    super(ErrorType.ConflictError, message, additionalInfo);
  }
}
