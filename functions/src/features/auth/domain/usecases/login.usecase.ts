import { UserEntity } from '../entities/user.entity';
import { AuthRepository } from '../repositories/auth.repository';
import { Either, Left } from '../../../../core/types';
import { AppFailure, ValidationFailure } from '../../../../core/errors/failures';
import { Validator } from '../../../../core/utils/validator';

export class LoginUseCase {
  constructor(private repository: AuthRepository) {}

  async execute(email: string, password: string): Promise<Either<AppFailure, UserEntity>> {
    // Validações
    const sanitizedEmail = Validator.sanitizeEmail(email);

    if (!sanitizedEmail || !password) {
      return new Left(new ValidationFailure('E-mail e senha são obrigatórios'));
    }

    if (!Validator.isValidEmail(sanitizedEmail)) {
      return new Left(new ValidationFailure('E-mail inválido'));
    }

    if (password.length < 6) {
      return new Left(new ValidationFailure('Senha inválida'));
    }

    return await this.repository.loginWithEmail(sanitizedEmail, password);
  }
}
