import { CustomError } from './custom-error.error';
import { ErrorType } from './error.type';

export class DataSourceError<T = any> extends CustomError {
  constructor(message: string, additionalInfo?: T) {
    super(ErrorType.DataSourceError, message, additionalInfo);
  }
}
