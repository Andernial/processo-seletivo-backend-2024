export enum StatusCode {
  NotFound = 404,
  Success = 200,
  BadRequest = 400,
  Unauthorized = 401,
  ServerError = 500,
  Conflict = 409,
}

export enum ErrorType {
  NotFoundError = StatusCode.NotFound,
  DataSourceError = StatusCode.ServerError,
  InvalidDataError = StatusCode.BadRequest,
  ServerError = StatusCode.ServerError,
  UnauthorizedError = StatusCode.Unauthorized,
  ConflictError = StatusCode.Conflict,
}
