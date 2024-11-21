import { User } from '@prisma/client';
import { UserInput } from '../zod-schema/user-validation.js';

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextCursor?: string;
}

export interface UserLoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface UsersQueryReturn {
  usersData: User[];
  pageInfo: PageInfo;
  usersTotal?: number;
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

export interface FindUserInput {
  id: number;
}

export interface Cursor {
  name: string;
  id: number;
}

export interface FindUsersInput {
  quantity: number;
  cursor?: string;
}
