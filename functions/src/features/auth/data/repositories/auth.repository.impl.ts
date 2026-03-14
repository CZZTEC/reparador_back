import { AuthRepository } from '../../domain/repositories/auth.repository';
import { UserEntity } from '../../domain/entities/user.entity';
import { AuthRemoteDataSource } from '../datasources/auth.remote.datasource';
import { Either, Left, Right } from '../../../../core/types';
import { AppFailure, ServerFailure, ValidationFailure } from '../../../../core/errors/failures';
import { AppException } from '../../../../core/errors/exceptions';
import { AppLogger } from '../../../../core/utils/logger';

export class AuthRepositoryImpl extends AuthRepository {
  constructor(private remoteDataSource: AuthRemoteDataSource) {
    super();
  }

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    userType: string,
  ): Promise<Either<AppFailure, UserEntity>> {
    try {
      const userModel = await this.remoteDataSource.register(
        email,
        password,
        firstName,
        lastName,
        userType,
      );

      return new Right(userModel.toEntity());
    } catch (error: any) {
      AppLogger.error('REGISTER_REPOSITORY_ERROR', error);

      if (error instanceof AppException) {
        return new Left(new ServerFailure(error.message));
      }

      return new Left(new ServerFailure('Erro ao registrar usuário'));
    }
  }

  async loginWithEmail(email: string, password: string): Promise<Either<AppFailure, UserEntity>> {
    try {
      const userModel = await this.remoteDataSource.loginWithEmail(email, password);
      return new Right(userModel.toEntity());
    } catch (error: any) {
      AppLogger.error('LOGIN_REPOSITORY_ERROR', error);

      if (error instanceof AppException) {
        return new Left(new ServerFailure(error.message));
      }

      return new Left(new ServerFailure('Erro ao fazer login'));
    }
  }

  async getUserById(uid: string): Promise<Either<AppFailure, UserEntity>> {
    try {
      const userModel = await this.remoteDataSource.getUserById(uid);
      return new Right(userModel.toEntity());
    } catch (error: any) {
      AppLogger.error('GET_USER_REPOSITORY_ERROR', error);
      return new Left(new ValidationFailure('Usuário não encontrado'));
    }
  }

  async getCurrentUser(uid: string): Promise<Either<AppFailure, UserEntity | null>> {
    try {
      const userModel = await this.remoteDataSource.getUserFromFirestore(uid);
      return new Right(userModel.toEntity());
    } catch (error: any) {
      if (error.message?.includes('não encontrado')) {
        return new Right(null);
      }
      AppLogger.error('GET_CURRENT_USER_ERROR', error);
      return new Left(new ServerFailure('Erro ao recuperar usuário'));
    }
  }

  async forgotPassword(email: string): Promise<Either<AppFailure, void>> {
    try {
      await this.remoteDataSource.sendPasswordResetEmail(email);
      return new Right(undefined);
    } catch (error: any) {
      AppLogger.error('FORGOT_PASSWORD_ERROR', error);
      return new Left(new ServerFailure('Erro ao enviar e-mail'));
    }
  }

  async logout(uid: string): Promise<Either<AppFailure, void>> {
    try {
      // Logout é geralmente feito no lado do cliente
      // Aqui podemos implementar revogação de tokens se necessário
      AppLogger.logAuth('LOGOUT', uid);
      return new Right(undefined);
    } catch (error: any) {
      AppLogger.error('LOGOUT_ERROR', error);
      return new Left(new ServerFailure('Erro ao fazer logout'));
    }
  }

  async verifyEmail(uid: string): Promise<Either<AppFailure, void>> {
    try {
      await this.remoteDataSource.getUserById(uid);
      // Implementar lógica de verificação de email
      return new Right(undefined);
    } catch (error: any) {
      AppLogger.error('VERIFY_EMAIL_ERROR', error);
      return new Left(new ServerFailure('Erro ao verificar e-mail'));
    }
  }

  async updateUser(
    uid: string,
    data: Partial<UserEntity>,
  ): Promise<Either<AppFailure, UserEntity>> {
    try {
      await this.remoteDataSource.updateUserInFirestore(uid, data);
      const updatedUser = await this.remoteDataSource.getUserFromFirestore(uid);
      return new Right(updatedUser.toEntity());
    } catch (error: any) {
      AppLogger.error('UPDATE_USER_ERROR', error);
      return new Left(new ServerFailure('Erro ao atualizar usuário'));
    }
  }
}
