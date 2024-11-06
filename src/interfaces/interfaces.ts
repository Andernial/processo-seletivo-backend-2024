import { UserInput } from '../zod-schema/user-validation.js';

export interface UserLogin {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface Login {
  user: UserInput;
  token: string;
}

export interface Token {
  id?: number;
  iat?: number;
  exp?: number;
}
