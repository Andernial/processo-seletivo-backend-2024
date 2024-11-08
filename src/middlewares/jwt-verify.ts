import { GraphQLError } from 'graphql';
import jwt from 'jsonwebtoken';
export const verifyToken = (token: string) => {
  try {
    const decode = jwt.verify(token, process.env.SECRET_KEY ?? '');
    return decode;
  } catch (error) {
    throw new GraphQLError('INVALID_SESSION_TOKEN: Error invalid or expired token', {
      extensions: {
        code: '401',
        http: {
          status: 200,
        },
        additionalInfo: error,
      },
    });
  }
};
