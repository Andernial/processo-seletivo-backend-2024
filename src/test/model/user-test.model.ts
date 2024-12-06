import { LoginInputModel, UserInputModel, UsersInputModel } from '@domain/model';

export interface UserVariable {
  userId: number;
}

export interface UsersVariable {
  usersInput: UsersInputModel;
}

export interface CreateUserVariable {
  createUserInput: UserInputModel;
}

export interface LoginVariable {
  loginInput: LoginInputModel;
}
