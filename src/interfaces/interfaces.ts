import { UserInput } from '../zod-schema/user-validation.js';

export interface UserLoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginReturn {
  user: UserInput;
  token: string;
}

export interface Token {
  id?: number;
  iat?: number;
  exp?: number;
}
