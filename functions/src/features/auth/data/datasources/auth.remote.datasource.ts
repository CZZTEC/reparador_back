import * as admin from 'firebase-admin';
import { UserModel } from '../models/user.model';
import { FirebaseException, ConflictException, ValidationException } from '../../../../core/errors/exceptions';
import { AppLogger } from '../../../../core/utils/logger';

export abstract class AuthRemoteDataSource {
  abstract register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    userType: string,
  ): Promise<UserModel>;

  abstract loginWithEmail(email: string, password: string): Promise<UserModel>;

  abstract getUserById(uid: string): Promise<UserModel>;

  abstract createUserInFirestore(uid: string, userData: any): Promise<void>;

  abstract getUserFromFirestore(uid: string): Promise<UserModel>;

  abstract updateUserInFirestore(uid: string, data: any): Promise<void>;

  abstract deleteAuthUser(uid: string): Promise<void>;

  abstract updateEmail(uid: string, newEmail: string): Promise<void>;

  abstract sendPasswordResetEmail(email: string): Promise<void>;

  abstract createCustomToken(uid: string): Promise<string>;

  abstract verifyIdToken(token: string): Promise<admin.auth.DecodedIdToken>;
}

export class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  private auth: admin.auth.Auth;
  private firestore: admin.firestore.Firestore;

  constructor() {
    this.auth = admin.auth();
    this.firestore = admin.firestore();
  }

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    userType: string,
  ): Promise<UserModel> {
    try {
      AppLogger.logAuth('REGISTER_ATTEMPT', undefined, { email });

      // Verificar se usuário já existe
      try {
        await this.auth.getUserByEmail(email);
        throw new ConflictException('Este e-mail já está registrado');
      } catch (error: any) {
        // Se o erro não for "user-not-found", re-throw
        if (error.code !== 'auth/user-not-found' && !error.message?.includes('já está registrado')) {
          throw error;
        }
      }

      // Criar usuário no Firebase Auth
      const userRecord = await this.auth.createUser({
        email,
        password,
        displayName: `${firstName} ${lastName}`,
      });

      AppLogger.logAuth('AUTH_USER_CREATED', userRecord.uid);

      const now = new Date();

      // Criar documento no Firestore
      const userData = {
        uid: userRecord.uid,
        email: userRecord.email,
        firstName,
        lastName,
        userType,
        emailVerified: false,
        isAdmin: false,
        photoURL: userRecord.photoURL,
        createdAt: now,
        updatedAt: now,
      };

      await this.createUserInFirestore(userRecord.uid, userData);

      AppLogger.logAuth('FIRESTORE_USER_CREATED', userRecord.uid);

      return UserModel.fromFirestore(userData);
    } catch (error: any) {
      AppLogger.error('REGISTER_ERROR', error);

      if (error instanceof ConflictException) {
        throw error;
      }

      if (error.code?.startsWith('auth/')) {
        throw new FirebaseException(error.code, this.mapFirebaseError(error.code));
      }

      throw new FirebaseException('UNKNOWN_ERROR', 'Erro ao registrar usuário');
    }
  }

  async loginWithEmail(email: string, password: string): Promise<UserModel> {
    try {
      AppLogger.logAuth('LOGIN_ATTEMPT', undefined, { email });

      // Obter usuário do Firebase Auth
      const userRecord = await this.auth.getUserByEmail(email);

      // Obter dados do Firestore
      const userModel = await this.getUserFromFirestore(userRecord.uid);

      AppLogger.logAuth('LOGIN_SUCCESS', userRecord.uid);

      return userModel;
    } catch (error: any) {
      AppLogger.error('LOGIN_ERROR', error);

      if (error.code === 'auth/user-not-found') {
        throw new ValidationException('Usuário não encontrado');
      }

      throw new FirebaseException(error.code || 'UNKNOWN', 'Erro ao fazer login');
    }
  }

  async getUserById(uid: string): Promise<UserModel> {
    try {
      await this.auth.getUser(uid);
      return await this.getUserFromFirestore(uid);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        throw new ValidationException('Usuário não encontrado');
      }
      throw new FirebaseException(error.code, 'Erro ao recuperar usuário');
    }
  }

  async createUserInFirestore(uid: string, userData: any): Promise<void> {
    try {
      await this.firestore.collection('users').doc(uid).set(userData);
      AppLogger.debug('FIRESTORE_USER_CREATED', { uid });
    } catch (error: any) {
      AppLogger.error('FIRESTORE_ERROR', { code: error.code, statusCode: error.statusCode });
      throw new FirebaseException(error.code || 'FIRESTORE_ERROR', `Firestore error: ${error.message}`);
    }
  }

  async getUserFromFirestore(uid: string): Promise<UserModel> {
    try {
      const doc = await this.firestore.collection('users').doc(uid).get();

      if (!doc.exists) {
        throw new ValidationException('Dados do usuário não encontrados');
      }

      return UserModel.fromFirestore(doc.data());
    } catch (error: any) {
      if (error instanceof ValidationException) {
        throw error;
      }
      throw new FirebaseException(error.code, 'Erro ao recuperar dados do usuário');
    }
  }

  async updateUserInFirestore(uid: string, data: any): Promise<void> {
    try {
      await this.firestore.collection('users').doc(uid).update({
        ...data,
        updatedAt: new Date(),
      });
    } catch (error: any) {
      throw new FirebaseException(error.code, 'Erro ao atualizar usuário');
    }
  }

  async deleteAuthUser(uid: string): Promise<void> {
    try {
      await this.auth.deleteUser(uid);
    } catch (error: any) {
      throw new FirebaseException(error.code, 'Erro ao deletar usuário');
    }
  }

  async updateEmail(uid: string, newEmail: string): Promise<void> {
    try {
      await this.auth.updateUser(uid, { email: newEmail });
    } catch (error: any) {
      throw new FirebaseException(error.code, 'Erro ao atualizar e-mail');
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      // Gerar link de reset de senha
      await this.auth.generatePasswordResetLink(email);
      
      // Aqui você pode enviar o email com o link usando um serviço de email
      // Por enquanto, apenas verificamos que o usuário existe e o link foi gerado
      AppLogger.info('PASSWORD_RESET_LINK_GENERATED', { email });
      
      // Nota: Para enviar o email, você precisará usar um serviço como SendGrid, Mailgun, etc.
      // Implementação futura de integração com serviço de email
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // Não revelar que o usuário não existe por segurança
        return;
      }
      throw new FirebaseException(error.code, 'Erro ao enviar e-mail');
    }
  }

  async createCustomToken(uid: string): Promise<string> {
    try {
      return await this.auth.createCustomToken(uid);
    } catch (error: any) {
      throw new FirebaseException(error.code, 'Erro ao criar token');
    }
  }

  async verifyIdToken(token: string): Promise<admin.auth.DecodedIdToken> {
    try {
      return await this.auth.verifyIdToken(token);
    } catch (error: any) {
      throw new FirebaseException(error.code, 'Token inválido');
    }
  }

  private mapFirebaseError(code: string): string {
    const errorMap: { [key: string]: string } = {
      'auth/email-already-exists': 'Este e-mail já está registrado',
      'auth/invalid-email': 'E-mail inválido',
      'auth/invalid-password': 'Senha inválida',
      'auth/user-not-found': 'Usuário não encontrado',
      'auth/wrong-password': 'Senha incorreta',
      'auth/operation-not-allowed': 'Operação não permitida',
      'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde',
    };

    return errorMap[code] || 'Erro ao processar solicitação';
  }
}
