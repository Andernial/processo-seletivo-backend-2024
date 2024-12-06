import { FileUpload } from 'graphql-upload-ts';
import csv from 'csv-parser';
import { Service } from 'typedi';
import { InvalidDataError } from '@core/error';
import { CsvInputModel } from '@domain/model';

@Service()
export class CsvService {
  async validate(file: FileUpload): Promise<CsvInputModel[]> {
    const fileStream = file.createReadStream();
    const rows: CsvInputModel[] = [];

    return new Promise((resolve, reject) => {
      fileStream
        .pipe(csv())
        .on('data', (data: CsvInputModel) => {
          rows.push(data);
        })
        .on('end', () => {
          resolve(rows);
        })
        .on('error', (error) => {
          reject(new InvalidDataError('INVALID_DATA: Malformed file or invalid data!', error));
        });
    });
  }
}
