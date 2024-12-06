import { CsvService } from '@core/csv/csv.service';
import { CsvInpuValidation } from '@core/csv/input/csv.input';
import { EmailService } from '@core/email/email.service';
import { AlreadyExistsError, InvalidDataError } from '@core/error';
import { generatePassword, hashPassword } from '@core/security/crypto';
import { AddressDbDataSource } from '@data/address/address.db.datasource';
import { UserDbDataSource } from '@data/user/user.db.datasource';
import { CsvInputModel, UserInputModel } from '@domain/model';
import { AddressInput } from '@graphql/module/address/input/address.input';
import { validate } from 'class-validator';
import { FileUpload } from 'graphql-upload-ts';
import path from 'path';
import { Service } from 'typedi';

@Service()
export class CsvUseCase {
  constructor(
    private readonly csvService: CsvService,
    private readonly userDbDataSource: UserDbDataSource,
    private readonly addressDbDataSource: AddressDbDataSource,
    private readonly emailService: EmailService,
  ) {}

  async exec(file: FileUpload) {
    const { filename } = file;

    const extension = path.extname(filename);

    if (extension != '.txt' && extension != '.csv') {
      throw new InvalidDataError('INVALID_DATA: The file must contain an extension .csv or .txt');
    }
    const csvData = await this.csvService.validate(file);

    if (csvData.length === 0) {
      throw new InvalidDataError('INVALID_DATA: The file must contain the data of at least one user!');
    }

    const emails = csvData.map((user: CsvInputModel) => user.email);
    const userAlreadyExist = await this.userDbDataSource.findManyByEmail(emails);

    if (userAlreadyExist.length > 0) {
      throw new AlreadyExistsError(
        'Registration Failed: one of the providen emails is already taken!',
        'Please try again using another email',
      );
    }

    const errorConstraints = await this.validateCsvData(csvData);

    if (errorConstraints.length > 0) {
      throw new InvalidDataError('INVALID_DATA: Invalid fields on the file!', errorConstraints);
    }

    const { csvUsers, csvAddress, originalPasswords } = this.storeData(csvData);

    for (const user of csvUsers) {
      user.password = await hashPassword(user.password);
    }

    const newUsers = await this.userDbDataSource.insertMany(csvUsers);
    const usersIds = newUsers.map((user) => user.id);
    await this.addressDbDataSource.insertMany(csvAddress, usersIds);

    this.sendEmails(csvData, originalPasswords);
  }

  async validateCsvData(csvData: CsvInputModel[]): Promise<unknown[]> {
    const errorConstraints: unknown[] = [];
    for (const user of csvData) {
      const csvInput = new CsvInpuValidation(user);

      const errors = await validate(csvInput, { stopAtFirstError: true });
      if (errors.length > 0) {
        const errorMessages = errors.map((error, index: number) => ({
          user: `User${index + 1}`,
          property: error.property,
          constraints: error.constraints,
        }));

        errorConstraints.push(errorMessages);
      }
    }
    return errorConstraints;
  }

  storeData(csvData: CsvInputModel[]) {
    const csvUsers: UserInputModel[] = [];
    const csvAddress: AddressInput[] = [];
    const originalPasswords: string[] = [];

    csvData.forEach((user: CsvInputModel) => {
      const newCsvUser = {
        name: user.name,
        email: user.email,
        password: generatePassword(12),
        birthDate: user.birthDate,
      };

      const newCsvAddress = {
        cep: user.cep,
        city: user.city,
        state: user.state,
        neighborhood: user.neighborhood,
        street: user.street,
        streetNumber: user.streetNumber,
        complement: user.complement,
      };

      csvUsers.push(newCsvUser);
      originalPasswords.push(newCsvUser.password);
      csvAddress.push(newCsvAddress);
    });
    return { csvUsers, csvAddress, originalPasswords };
  }

  async sendEmails(csvData: CsvInputModel[], passwords: string[]): Promise<void> {
    for (const [i, user] of csvData.entries()) {
      // await this.emailService.sendEmail(user.name, user.email, passwords[i]);
      console.log(`email sent to ${user.name} new password: ${passwords[i]}`);
    }
  }
}
