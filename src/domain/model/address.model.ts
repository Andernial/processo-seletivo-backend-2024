export interface AddressModel {
  id: number;
  cep: string;
  street: string;
  streetNumber: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  userId: number;
}

export interface AddressInputModel {
  cep: string;
  street: string;
  streetNumber: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export enum estados {
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
