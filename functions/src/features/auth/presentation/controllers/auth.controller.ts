import { Response } from 'express';
import { RegisterUseCase } from '../../domain/usecases/register.usecase';
import { LoginUseCase } from '../../domain/usecases/login.usecase';
import { GetCurrentUserUseCase, ForgotPasswordUseCase, LogoutUseCase } from '../../domain/usecases/index';
import { ApiResponse } from '../../../../core/types';
import { AppLogger } from '../../../../core/utils/logger';
import { Validator } from '../../../../core/utils/validator';

export class AuthController {
  constructor(
    private registerUseCase: RegisterUseCase,
    private loginUseCase: LoginUseCase,
    private getCurrentUserUseCase: GetCurrentUserUseCase,
    private forgotPasswordUseCase: ForgotPasswordUseCase,
    private logoutUseCase: LogoutUseCase,
  ) {}

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    userType: string,
    res: Response,
  ): Promise<void> {
    try {
      AppLogger.info('REGISTER_CONTROLLER', { email });

      const result = await this.registerUseCase.execute(
        email,
        password,
        firstName,
        lastName,
        userType,
      );

      result.fold(
        (failure) => {
          const response: ApiResponse<null> = {
            success: false,
            message: failure.message,
            statusCode: failure.statusCode || 500,
          };
          res.status(failure.statusCode || 500).json(response);
        },
        (user) => {
          const response: ApiResponse<any> = {
            success: true,
            message: 'Usuário registrado com sucesso',
            data: user.toJSON(),
            statusCode: 201,
          };
          res.status(201).json(response);
        },
      );
    } catch (error: any) {
      AppLogger.error('REGISTER_CONTROLLER_ERROR', error);
      const response: ApiResponse<null> = {
        success: false,
        message: 'Erro ao registrar usuário',
        statusCode: 500,
      };
      res.status(500).json(response);
    }
  }

  async login(
    email: string,
    password: string,
    res: Response,
  ): Promise<void> {
    try {
      AppLogger.info('LOGIN_CONTROLLER', { email });

      const result = await this.loginUseCase.execute(email, password);

      result.fold(
        (failure) => {
          const response: ApiResponse<null> = {
            success: false,
            message: failure.message,
            statusCode: failure.statusCode || 500,
          };
          res.status(failure.statusCode || 500).json(response);
        },
        (user) => {
          const response: ApiResponse<any> = {
            success: true,
            message: 'Login realizado com sucesso',
            data: user.toJSON(),
            statusCode: 200,
          };
          res.status(200).json(response);
        },
      );
    } catch (error: any) {
      AppLogger.error('LOGIN_CONTROLLER_ERROR', error);
      const response: ApiResponse<null> = {
        success: false,
        message: 'Erro ao fazer login',
        statusCode: 500,
      };
      res.status(500).json(response);
    }
  }

  async getCurrentUser(uid: string, res: Response): Promise<void> {
    try {
      const result = await this.getCurrentUserUseCase.execute(uid);

      result.fold(
        (failure) => {
          const response: ApiResponse<null> = {
            success: false,
            message: failure.message,
            statusCode: failure.statusCode || 500,
          };
          res.status(failure.statusCode || 500).json(response);
        },
        (user) => {
          const response: ApiResponse<any> = {
            success: true,
            message: 'Usuário recuperado',
            data: user ? user.toJSON() : null,
            statusCode: 200,
          };
          res.status(200).json(response);
        },
      );
    } catch (error: any) {
      AppLogger.error('GET_CURRENT_USER_ERROR', error);
      const response: ApiResponse<null> = {
        success: false,
        message: 'Erro ao recuperar usuário',
        statusCode: 500,
      };
      res.status(500).json(response);
    }
  }

  async forgotPassword(email: string, res: Response): Promise<void> {
    try {
      if (!Validator.isValidEmail(email)) {
        const response: ApiResponse<null> = {
          success: false,
          message: 'E-mail inválido',
          statusCode: 400,
        };
        res.status(400).json(response);
        return;
      }

      const result = await this.forgotPasswordUseCase.execute(email);

      result.fold(
        (failure) => {
          const response: ApiResponse<null> = {
            success: false,
            message: failure.message,
            statusCode: failure.statusCode || 500,
          };
          res.status(failure.statusCode || 500).json(response);
        },
        () => {
          const response: ApiResponse<null> = {
            success: true,
            message: 'E-mail de redefinição enviado',
            statusCode: 200,
          };
          res.status(200).json(response);
        },
      );
    } catch (error: any) {
      AppLogger.error('FORGOT_PASSWORD_CONTROLLER_ERROR', error);
      const response: ApiResponse<null> = {
        success: false,
        message: 'Erro ao enviar e-mail',
        statusCode: 500,
      };
      res.status(500).json(response);
    }
  }

  async logout(uid: string, res: Response): Promise<void> {
    try {
      const result = await this.logoutUseCase.execute(uid);

      result.fold(
        (failure) => {
          const response: ApiResponse<null> = {
            success: false,
            message: failure.message,
            statusCode: failure.statusCode || 500,
          };
          res.status(failure.statusCode || 500).json(response);
        },
        () => {
          const response: ApiResponse<null> = {
            success: true,
            message: 'Logout realizado',
            statusCode: 200,
          };
          res.status(200).json(response);
        },
      );
    } catch (error: any) {
      AppLogger.error('LOGOUT_CONTROLLER_ERROR', error);
      const response: ApiResponse<null> = {
        success: false,
        message: 'Erro ao fazer logout',
        statusCode: 500,
      };
      res.status(500).json(response);
    }
  }
}
