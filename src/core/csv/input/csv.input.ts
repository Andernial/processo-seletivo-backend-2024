import { CsvInputModel, estados } from '@domain/model';
import { IsEmail, IsEnum, IsISO8601, IsNotEmpty, IsOptional, Length, MaxLength, MinLength } from 'class-validator';

export class CsvInpuValidation implements CsvInputModel {
  @MinLength(4, { message: 'Nome deve conter ao menos 4 caracteres' })
  name: string;

  @IsEmail(undefined, { message: 'Informe um email válido' })
  email: string;

  @IsISO8601(undefined, { message: 'Informe uma data válida seguindo o formato 0000-00-00' })
  birthDate: string;

  @Length(9, 9, { message: 'O cep deve conter 8 dígitos e seguir o formato 00000-000' })
  cep: string;

  @IsNotEmpty({ message: 'O nome da rua não pode ser vazio' })
  @MaxLength(255, { message: 'O nome da rua deve conter no máximo 255 caracteres' })
  street: string;

  @IsNotEmpty({ message: 'O número não pode ser vazio' })
  @MaxLength(10, { message: 'O número da rua deve conter no máximo 10 caracteres' })
  streetNumber: string;

  @IsOptional()
  @MaxLength(60, { message: 'O complemento deve conter no máximo 60 caracteres' })
  complement?: string;

  @MaxLength(255, { message: 'A cidade deve conter no máximo 255 caracteres' })
  @IsNotEmpty({ message: 'O campo cidade não pode ser vazio' })
  neighborhood: string;

  @MaxLength(255, { message: 'A cidade deve conter no máximo 255 caracteres' })
  @IsNotEmpty({ message: 'O campo cidade não pode ser vazio' })
  city: string;

  @IsEnum(estados, { message: `Selecione um dos estados do Brasil! opções: ${Object.values(estados).join(' | ')}` })
  state: string;

  constructor(data?: CsvInpuValidation) {
    if (data) {
      this.updateData(data);
    }
  }

  updateData(data: CsvInputModel): void {
    this.name = data.name;
    this.email = data.email;
    this.birthDate = data.birthDate;
    this.cep = data.cep;
    this.street = data.street;
    this.streetNumber = data.streetNumber;
    this.complement = data.complement;
    this.neighborhood = data.neighborhood;
    this.city = data.city;
    this.state = data.state;
  }
}
