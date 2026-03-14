import { UserEntity } from '../entities/user.entity';
import { AuthRepository } from '../repositories/auth.repository';
import { Either, Left } from '../../../../core/types';
import { AppFailure, ValidationFailure } from '../../../../core/errors/failures';
import { Validator } from '../../../../core/utils/validator';

export class RegisterUseCase {
  constructor(private repository: AuthRepository) {}

  async execute(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    userType: string,
  ): Promise<Either<AppFailure, UserEntity>> {
    // Validações
    const sanitizedEmail = Validator.sanitizeEmail(email);
    const sanitizedFirstName = Validator.sanitizeName(firstName);
    const sanitizedLastName = Validator.sanitizeName(lastName);

    if (
      !sanitizedEmail ||
      !password ||
      !sanitizedFirstName ||
      !sanitizedLastName
    ) {
      return new Left(new ValidationFailure('Preencha todos os campos'));
    }

    if (!Validator.isValidEmail(sanitizedEmail)) {
      return new Left(new ValidationFailure('E-mail inválido'));
    }

    if (!Validator.isValidPassword(password)) {
      return new Left(
        new ValidationFailure(
          'Senha deve ter: mínimo 12 caracteres, uma maiúscula, uma minúscula, um número e um caractere especial (!@#$%^&*)', 
        ),
      );
    }

    if (!Validator.isValidName(sanitizedFirstName)) {
      return new Left(new ValidationFailure('Nome deve ter no mínimo 2 caracteres'));
    }

    if (!Validator.isValidName(sanitizedLastName)) {
      return new Left(new ValidationFailure('Sobrenome deve ter no mínimo 2 caracteres'));
    }

    if (!Validator.isValidUserType(userType)) {
      return new Left(new ValidationFailure('Tipo de usuário inválido'));
    }

    return await this.repository.register(
      sanitizedEmail,
      password,
      sanitizedFirstName,
      sanitizedLastName,
      userType,
    );
  }
}
