import { CursorModel } from '@domain/model';
import { InvalidDataError } from '@core/error';

export function base64Encode(cursor: CursorModel) {
  const stringNewCursor = JSON.stringify(cursor);
  return Buffer.from(stringNewCursor).toString('base64');
}

export function decodeObject(cursor: string) {
  try {
    const jsonString = Buffer.from(cursor, 'base64').toString();
    return JSON.parse(jsonString) as CursorModel;
  } catch {
    throw new InvalidDataError(
      'INVALID_CURSOR: Invalid or malformed cursor string',
      'Please provide a valid cursor string',
    );
  }
}
