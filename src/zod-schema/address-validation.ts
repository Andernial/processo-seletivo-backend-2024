import { z } from 'zod';

enum estados {
  Acre = 'Acre',
  Alagoas = 'Alagoas',
  Amapá = 'Amapá',
  Amazonas = 'Amazonas',
  Bahia = 'Bahia',
  Ceará = 'Ceará',
  DistritoFederal = 'Distrito Federal',
  EspiritoSanto = 'Espírito Santo',
  Goiás = 'Goiás',
  Maranhão = 'Maranhão',
  MatoGrosso = 'Mato Grosso',
  MatoGrossoDoSul = 'Mato Grosso do Sul',
  MinasGerais = 'Minas Gerais',
  Pará = 'Pará',
  Paraiba = 'Paraíba',
  Paraná = 'Paraná',
  Pernambuco = 'Pernambuco',
  Piaui = 'Piauí',
  RioDeJaneiro = 'Rio de Janeiro',
  RioGrandeDoNorte = 'Rio Grande do Norte',
  RioGrandeDoSul = 'Rio Grande do Sul',
  Rondonia = 'Rondônia',
  Roraima = 'Roraima',
  SantaCatarina = 'Santa Catarina',
  SaoPaulo = 'São Paulo',
  Sergipe = 'Sergipe',
  Tocantins = 'Tocantins',
}

export const AddressValidationSchema = z.object({
  userId: z.number(),
  cep: z.string().length(9, 'O cep deve conter 8 digitos e seguir o formato 00000-000'),
  street: z
    .string()
    .min(10, 'O nome da rua deve conter ao menos 10 caracteres')
    .max(35, 'O nome da rua deve conter no máximo 35 caracteres'),
  streetNumber: z.string().max(50, 'O número da rua deve conter no máximo 50 caracteres'),
  complement: z
    .nullable(
      z
        .string()
        .min(5, 'O complemento deve conter ao menos 5 caracteres')
        .max(50, 'O complemento deve conter no máximo 50 caracteres'),
    )
    .optional(),

  neighborhood: z
    .string()
    .min(4, 'O bairro deve conter ao menos 4 caracteres')
    .max(60, 'O bairro deve conter no máximo 60 caracteres'),
  city: z
    .string()
    .min(4, 'A cidade deve conter ao menos 4 caracteres')
    .max(60, 'A cidade deve conter no máximo 60 caracteres'),
  state: z.nativeEnum(estados, {
    errorMap: () => {
      return { message: 'Selecione um dos estados do brasil!' };
    },
  }),
});
