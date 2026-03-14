import { AuthController } from './controllers/auth.controller';
import { RegisterUseCase } from '../domain/usecases/register.usecase';
import { LoginUseCase } from '../domain/usecases/login.usecase';
import { GetCurrentUserUseCase, ForgotPasswordUseCase, LogoutUseCase } from '../domain/usecases/index';
import { AuthRepositoryImpl } from '../data/repositories/auth.repository.impl';
import { AuthRemoteDataSourceImpl } from '../data/datasources/auth.remote.datasource';

export class AuthServiceLocator {
  private static instance: AuthServiceLocator;
  private controller: AuthController | null = null;

  private constructor() {}

  static getInstance(): AuthServiceLocator {
    if (!AuthServiceLocator.instance) {
      AuthServiceLocator.instance = new AuthServiceLocator();
    }
    return AuthServiceLocator.instance;
  }

  getAuthController(): AuthController {
    if (this.controller) {
      return this.controller;
    }

    // Criar instâncias
    const remoteDataSource = new AuthRemoteDataSourceImpl();
    const repository = new AuthRepositoryImpl(remoteDataSource);

    // Criar Use Cases
    const registerUseCase = new RegisterUseCase(repository);
    const loginUseCase = new LoginUseCase(repository);
    const getCurrentUserUseCase = new GetCurrentUserUseCase(repository);
    const forgotPasswordUseCase = new ForgotPasswordUseCase(repository);
    const logoutUseCase = new LogoutUseCase(repository);

    // Criar Controller
    this.controller = new AuthController(
      registerUseCase,
      loginUseCase,
      getCurrentUserUseCase,
      forgotPasswordUseCase,
      logoutUseCase,
    );

    return this.controller;
  }
}
