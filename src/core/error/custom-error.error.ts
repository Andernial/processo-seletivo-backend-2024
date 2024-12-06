import { ErrorType, StatusCode } from './error.type';

export class CustomError<T = any> extends Error {
  code: ErrorType | StatusCode;
  message: string;
  additionalInfo?: T;
  constructor(code: ErrorType | StatusCode, message: string, additionalInfo?: T) {
    super(message);
    this.code = code;
    this.message = message;
    this.additionalInfo = additionalInfo;
  }
}
