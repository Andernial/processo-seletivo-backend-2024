import { AddressModel } from './address.model.js';

export interface PageInfoModel {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextCursor?: string;
}

export interface UserModel {
  id: number;
  name: string;
  email: string;
  birthDate: string;
}

export interface UserAddressModel {
  id: number;
  name: string;
  email: string;
  birthDate: string;
  address: AddressModel[];
}

export interface UserModelWithPassword {
  id: number;
  name: string;
  email: string;
  birthDate: string;
  password: string;
}

export interface UserInputModel {
  name: string;
  email: string;
  password: string;
  birthDate: string;
}

export interface CsvInputModel {
  name: string;
  email: string;
  birthDate: string;
  cep: string;
  street: string;
  streetNumber: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface LoginInputModel {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface UserQueryModel {
  userData: UserModel;
  address: AddressModel[];
}

export interface UsersQueryModel {
  usersData: UserQueryModel[];
  pageInfo: PageInfoModel;
  usersTotal?: number;
}

export interface UsersInputModel {
  quantity?: number;
  cursor?: string;
}

export interface LoginModel {
  user: UserModel;
  token: string;
}

export interface CursorModel {
  name: string;
  id: number;
}
