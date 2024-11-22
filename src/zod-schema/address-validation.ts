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
  cep: z.string().length(9, 'O cep deve conter 8 dígitos e seguir o formato 00000-000'),
  street: z
    .string()
    .min(10, 'O nome da rua deve conter pelo menos 10 caracteres')
    .max(255, 'O nome da rua deve conter no máximo 255 caracteres'),
  streetNumber: z
    .string()
    .min(1, 'O número deve conter pelo menos 1 caractere')
    .max(10, 'O número da rua deve conter no máximo 10 caracteres'),
  complement: z
    .nullable(
      z
        .string()
        .min(5, 'O complemento deve conter pelo menos 5 caracteres')
        .max(60, 'O complemento deve conter no máximo 60 caracteres'),
    )
    .optional(),

  neighborhood: z
    .string()
    .min(4, 'O bairro deve conter pelo menos 4 caracteres')
    .max(60, 'O bairro deve conter no máximo 60 caracteres'),
  city: z
    .string()
    .min(4, 'A cidade deve conter pelo menos 4 caracteres')
    .max(60, 'A cidade deve conter no máximo 60 caracteres'),
  state: z.nativeEnum(estados, {
    errorMap: () => {
      return { message: 'Selecione um dos estados do Brasil!' };
    },
  }),
});

export type AddressInput = z.infer<typeof AddressValidationSchema>;
