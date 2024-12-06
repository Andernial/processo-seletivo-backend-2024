import { CsvService } from '@core/csv/csv.service';
import { CsvInpuValidation } from '@core/csv/input/csv.input';
import { EmailService } from '@core/email/email.service';
import { AlreadyExistsError, InvalidDataError } from '@core/error';
import { generatePassword, hashPassword } from '@core/security/crypto';
import { AddressDbDataSource } from '@data/address/address.db.datasource';
import { UserDbDataSource } from '@data/user/user.db.datasource';
import { CsvInputModel } from '@domain/model';
import { validate } from 'class-validator';
import { FileUpload } from 'graphql-upload-ts';
import path from 'path';
import { Service } from 'typedi';
@Service()
export class CreateManyUsersUseCase {
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
    const csvInput = new CsvInpuValidation();

    for (const [i, user] of csvData.entries()) {
      csvInput.updateData(user);
      const errors = await validate(csvInput, { stopAtFirstError: true });

      if (errors.length > 0) {
        const errorMessages = errors.map((error) => ({
          user: `User${i + 1}`,
          property: error.property,
          constraints: error.constraints,
        }));

        errorConstraints.push(...errorMessages);
      }
    }
    return errorConstraints;
  }

  storeData(csvData: CsvInputModel[]) {
    return csvData.reduce(
      (previous, user: CsvInputModel) => {
        const newCsvUser = {
          name: user.name,
          email: user.email,
          password: generatePassword({ length: 12 }),
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

        previous.csvUsers.push(newCsvUser);
        previous.originalPasswords.push(newCsvUser.password);
        previous.csvAddress.push(newCsvAddress);

        return previous;
      },
      {
        csvUsers: [],
        csvAddress: [],
        originalPasswords: [],
      },
    );
  }

  async sendEmails(csvData: CsvInputModel[], passwords: string[]): Promise<void> {
    for (const [i, user] of csvData.entries()) {
      console.log(`email sent to ${user.name} new password: ${passwords[i]}`);
    }
  }
}
