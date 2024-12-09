import { ReadStream } from 'fs';
import FormData from 'form-data';

export function appendFormData(file: ReadStream, mutation: string): FormData {
  const formData = new FormData();

  formData.append(
    'operations',
    JSON.stringify({
      query: mutation,
      variables: { file: null },
    }),
  );

  formData.append(
    'map',
    JSON.stringify({
      0: ['variables.file'],
    }),
  );
  formData.append('0', file);

  return formData;
}
