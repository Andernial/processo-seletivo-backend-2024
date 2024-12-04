import { AuthChecker } from 'type-graphql';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '@core/error/unauthorized-error.error';

export interface JwtPayloadModel {
  id: number;
  iat: number;
  exp: number;
}

export interface ContextModel {
  userId: number;
  token: string;
}

export const customAuthChecker: AuthChecker<ContextModel> = ({ context }) => {
  const token = context.token;

  if (!token) {
    throw new UnauthorizedError('ACCESS_DENIED: You need to be logged in to access this query');
  }

  try {
    const decode = jwt.verify(token, process.env.SECRET_KEY ?? '') as JwtPayloadModel;
    context.userId = decode.id;
    return true;
  } catch (error) {
    throw new UnauthorizedError('INVALID_SESSION_TOKEN: Error invalid or expired token', error);
  }
};
