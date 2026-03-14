// TypeScript version
export abstract class AppFailure {
  message: string;
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    this.message = message;
    this.statusCode = statusCode;
  }
}

export class ValidationFailure extends AppFailure {
  constructor(message: string) {
    super(message, 400);
  }
}

export class ServerFailure extends AppFailure {
  constructor(message: string) {
    super(message, 500);
  }
}

export class NotFoundFailure extends AppFailure {
  constructor(message: string) {
    super(message, 404);
  }
}

export class UnauthorizedFailure extends AppFailure {
  constructor(message: string) {
    super(message, 401);
  }
}

export class ConflictFailure extends AppFailure {
  constructor(message: string) {
    super(message, 409);
  }
}

export class FirebaseFailure extends AppFailure {
  code: string;

  constructor(code: string, message: string) {
    super(message, 500);
    this.code = code;
  }
}

export class NetworkFailure extends AppFailure {
  constructor(message: string = 'Erro de conexão') {
    super(message, 503);
  }
}
