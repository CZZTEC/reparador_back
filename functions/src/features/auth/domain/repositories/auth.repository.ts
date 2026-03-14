import { UserEntity } from '../entities/user.entity';
import { Either } from '../../../../core/types';
import { AppFailure } from '../../../../core/errors/failures';

export abstract class AuthRepository {
  abstract register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    userType: string,
  ): Promise<Either<AppFailure, UserEntity>>;

  abstract loginWithEmail(email: string, password: string): Promise<Either<AppFailure, UserEntity>>;

  abstract getUserById(uid: string): Promise<Either<AppFailure, UserEntity>>;

  abstract getCurrentUser(uid: string): Promise<Either<AppFailure, UserEntity | null>>;

  abstract forgotPassword(email: string): Promise<Either<AppFailure, void>>;

  abstract logout(uid: string): Promise<Either<AppFailure, void>>;

  abstract verifyEmail(uid: string): Promise<Either<AppFailure, void>>;

  abstract updateUser(uid: string, data: Partial<UserEntity>): Promise<Either<AppFailure, UserEntity>>;
}
