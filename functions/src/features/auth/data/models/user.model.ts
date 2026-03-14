import { UserEntity } from '../../domain/entities/user.entity';

export interface UserFirestoreData {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'client' | 'professional' | 'business';
  emailVerified: boolean;
  isAdmin: boolean;
  photoURL?: string;
  phone?: string;
  createdAt: Date | FirebaseFirestore.Timestamp;
  updatedAt: Date | FirebaseFirestore.Timestamp;
}

export class UserModel implements UserFirestoreData {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'client' | 'professional' | 'business';
  emailVerified: boolean;
  isAdmin: boolean;
  photoURL?: string;
  phone?: string;
  createdAt: Date | FirebaseFirestore.Timestamp;
  updatedAt: Date | FirebaseFirestore.Timestamp;

  constructor(data: UserFirestoreData) {
    this.uid = data.uid;
    this.email = data.email;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.userType = data.userType;
    this.emailVerified = data.emailVerified;
    this.isAdmin = data.isAdmin;
    this.photoURL = data.photoURL;
    this.phone = data.phone;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Converter para Entity
  toEntity(): UserEntity {
    const createdAt = this.createdAt instanceof Date ? this.createdAt : this.createdAt.toDate();
    const updatedAt = this.updatedAt instanceof Date ? this.updatedAt : this.updatedAt.toDate();

    return new UserEntity(
      this.uid,
      this.email,
      this.firstName,
      this.lastName,
      this.userType,
      this.emailVerified,
      this.isAdmin,
      createdAt,
      updatedAt,
      this.photoURL,
      this.phone,
    );
  }

  // Converter de Entity para Model
  static fromEntity(entity: UserEntity): UserModel {
    return new UserModel({
      uid: entity.uid,
      email: entity.email,
      firstName: entity.firstName,
      lastName: entity.lastName,
      userType: entity.userType,
      emailVerified: entity.emailVerified,
      isAdmin: entity.isAdmin,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      photoURL: entity.photoURL,
      phone: entity.phone,
    });
  }

  // Converter de document snapshot
  static fromFirestore(data: any): UserModel {
    return new UserModel({
      uid: data.uid,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      userType: data.userType || 'client',
      emailVerified: data.emailVerified || false,
      isAdmin: data.isAdmin || false,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
      photoURL: data.photoURL,
      phone: data.phone,
    });
  }

  toFirestore(): object {
    return {
      uid: this.uid,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      userType: this.userType,
      emailVerified: this.emailVerified,
      isAdmin: this.isAdmin,
      photoURL: this.photoURL,
      phone: this.phone,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
