import { Arg, Authorized, Int, Mutation, Query, Resolver } from 'type-graphql';
import { Service } from 'typedi';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';
import { LoginInputModel, LoginModel, UserInputModel, UserModel, UserQueryModel, UsersQueryModel } from '@domain/model';
import { UsersQuery, UserQuery, User } from './type';
import { PaginationInput } from './input';
import { UsersUseCase, UserUseCase, CreateUserUseCase, LoginUseCase, CsvUseCase } from '@domain/user';
import { UserInput } from './input/user.input';
import { Login } from './type/login.type';
import { LoginInput } from './input/login.input';

@Service()
@Resolver()
export class UserResolver {
  constructor(
    private readonly userUseCase: UserUseCase,
    private readonly usersUseCase: UsersUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly csvUseCase: CsvUseCase,
  ) {}

  @Query(() => UserQuery)
  @Authorized()
  async user(@Arg('id', () => Int) id: number): Promise<UserQueryModel> {
    return await this.userUseCase.exec(id);
  }

  @Query(() => UsersQuery)
  @Authorized()
  async users(
    @Arg('data', () => PaginationInput, { nullable: true }) input?: PaginationInput,
  ): Promise<UsersQueryModel> {
    return await this.usersUseCase.exec(input);
  }

  @Mutation(() => User)
  async createUser(@Arg('data', () => UserInput) input: UserInputModel): Promise<UserModel> {
    return await this.createUserUseCase.exec(input);
  }

  @Mutation(() => Login)
  async login(@Arg('data', () => LoginInput) input: LoginInputModel): Promise<LoginModel> {
    return await this.loginUseCase.exec(input);
  }

  @Mutation(() => String)
  async uploadCsv(@Arg('file', () => GraphQLUpload) file: FileUpload): Promise<string> {
    await this.csvUseCase.exec(file);
    return 'Upload realizado com sucesso! Usuários adicionados no banco de dados';
  }
}
