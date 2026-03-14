export class UserEntity {
  constructor(
    readonly uid: string,
    readonly email: string,
    readonly firstName: string,
    readonly lastName: string,
    readonly userType: 'client' | 'professional' | 'business',
    readonly emailVerified: boolean,
    readonly isAdmin: boolean,
    readonly createdAt: Date,
    readonly updatedAt: Date,
    readonly photoURL?: string,
    readonly phone?: string,
  ) {}

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  get initials(): string {
    let initials = '';
    if (this.firstName.length > 0) initials += this.firstName[0].toUpperCase();
    if (this.lastName.length > 0) initials += this.lastName[0].toUpperCase();
    return initials || '?';
  }

  get isClient(): boolean {
    return this.userType === 'client';
  }

  get isProfessional(): boolean {
    return this.userType === 'professional';
  }

  get isBusinessOwner(): boolean {
    return this.userType === 'business';
  }

  get hasPhoto(): boolean {
    return !!this.photoURL && this.photoURL.length > 0;
  }

  toJSON(): object {
    return {
      uid: this.uid,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.fullName,
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
