export class AppException extends Error {
  statusCode: number;
  code: string;

  constructor(code: string, message: string, statusCode: number = 500) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.name = 'AppException';
  }
}

export class ValidationException extends AppException {
  constructor(message: string) {
    super('VALIDATION_ERROR', message, 400);
    this.name = 'ValidationException';
  }
}

export class UnauthorizedException extends AppException {
  constructor(message: string = 'Não autorizado') {
    super('UNAUTHORIZED', message, 401);
    this.name = 'UnauthorizedException';
  }
}

export class NotFoundException extends AppException {
  constructor(message: string = 'Não encontrado') {
    super('NOT_FOUND', message, 404);
    this.name = 'NotFoundException';
  }
}

export class ConflictException extends AppException {
  constructor(message: string) {
    super('CONFLICT', message, 409);
    this.name = 'ConflictException';
  }
}

export class FirebaseException extends AppException {
  firebaseCode: string;

  constructor(firebaseCode: string, message: string) {
    super('FIREBASE_ERROR', message, 500);
    this.firebaseCode = firebaseCode;
    this.name = 'FirebaseException';
  }
}

export class ServerException extends AppException {
  constructor(message: string) {
    super('SERVER_ERROR', message, 500);
    this.name = 'ServerException';
  }
}

export class NetworkException extends AppException {
  constructor(message: string = 'Erro de conectividade') {
    super('NETWORK_ERROR', message, 503);
    this.name = 'NetworkException';
  }
}
