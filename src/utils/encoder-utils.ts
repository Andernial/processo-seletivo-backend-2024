import { GraphQLError } from 'graphql';
import { Cursor } from '../interfaces/interfaces.js';

export function base64Encode(cursor: Cursor) {
  const stringNewCursor = JSON.stringify(cursor);
  return Buffer.from(stringNewCursor).toString('base64');
}

export function decodeObject(cursor: string) {
  try {
    const jsonString = Buffer.from(cursor, 'base64').toString();
    return JSON.parse(jsonString) as Cursor;
  } catch {
    throw new GraphQLError('INVALID_CURSOR: Invalid or malformed cursor string', {
      extensions: {
        code: '400',
        additionalInfo: 'Please provide a valid cursor string',
      },
    });
  }
}
