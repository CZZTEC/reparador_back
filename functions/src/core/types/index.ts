// Response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  statusCode: number;
}

export interface Either<L, R> {
  isRight(): boolean;
  isLeft(): boolean;
  fold<T>(onLeft: (value: L) => T, onRight: (value: R) => T): T;
}

export class Right<L, R> implements Either<L, R> {
  constructor(readonly value: R) {}

  isRight(): boolean {
    return true;
  }

  isLeft(): boolean {
    return false;
  }

  fold<T>(onLeft: (value: L) => T, onRight: (value: R) => T): T {
    return onRight(this.value);
  }
}

export class Left<L, R> implements Either<L, R> {
  constructor(readonly value: L) {}

  isRight(): boolean {
    return false;
  }

  isLeft(): boolean {
    return true;
  }

  fold<T>(onLeft: (value: L) => T, onRight: (value: R) => T): T {
    return onLeft(this.value);
  }
}

// User types
export interface UserModel {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  photoURL?: string;
  phone?: string;
  emailVerified: boolean;
  isAdmin: boolean;
  userType: 'client' | 'professional' | 'business';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: 'client' | 'professional' | 'business';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserModel;
}

// Request/Response Dto
export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: string;
}

export interface AuthResponse {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  token?: string;
  createdAt: string;
}
