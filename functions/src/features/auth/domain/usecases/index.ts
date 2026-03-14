import { UserEntity } from '../entities/user.entity';
import { AuthRepository } from '../repositories/auth.repository';
import { Either } from '../../../../core/types';
import { AppFailure } from '../../../../core/errors/failures';

export class GetCurrentUserUseCase {
  constructor(private repository: AuthRepository) {}

  async execute(uid: string): Promise<Either<AppFailure, UserEntity | null>> {
    return await this.repository.getCurrentUser(uid);
  }
}

export class ForgotPasswordUseCase {
  constructor(private repository: AuthRepository) {}

  async execute(email: string): Promise<Either<AppFailure, void>> {
    return await this.repository.forgotPassword(email);
  }
}

export class LogoutUseCase {
  constructor(private repository: AuthRepository) {}

  async execute(uid: string): Promise<Either<AppFailure, void>> {
    return await this.repository.logout(uid);
  }
}

export class VerifyEmailUseCase {
  constructor(private repository: AuthRepository) {}

  async execute(uid: string): Promise<Either<AppFailure, void>> {
    return await this.repository.verifyEmail(uid);
  }
}
