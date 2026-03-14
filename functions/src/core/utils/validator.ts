export class Validator {
  // Senhas comuns que devem ser rejeitadas
  private static readonly COMMON_PASSWORDS = [
    'password', 'password1', 'password123', 'qwerty', 'qwerty123',
    'admin', 'admin123', '12345678', 'letmein', 'welcome',
    'monkey', 'login', 'master', 'sunshine', 'princess',
    'iloveyou', 'abc123', 'football', 'shadow', 'michael'
  ];

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return emailRegex.test(email);
  }

  static isValidPassword(password: string): boolean {
    // Mínimo 12 caracteres (aumentado de 8)
    if (password.length < 12) {
      return false;
    }

    // Máximo 128 caracteres
    if (password.length > 128) {
      return false;
    }

    // Pelo menos uma letra maiúscula
    if (!/[A-Z]/.test(password)) {
      return false;
    }

    // Pelo menos uma letra minúscula
    if (!/[a-z]/.test(password)) {
      return false;
    }

    // Pelo menos um número
    if (!/\d/.test(password)) {
      return false;
    }

    // Pelo menos um caractere especial
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return false;
    }

    // Verificar contra senhas comuns
    const lowercasePassword = password.toLowerCase();
    for (const commonPassword of this.COMMON_PASSWORDS) {
      if (lowercasePassword.includes(commonPassword)) {
        return false;
      }
    }

    // Não permitir sequências óbvias (ex: abc123, 123456)
    if (/(.)\1{2,}/.test(password)) {
      // Mais de 2 caracteres iguais em sequência
      return false;
    }

    return true;
  }

  static isValidName(name: string): boolean {
    return name.trim().length >= 2;
  }

  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  static sanitizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  static sanitizeName(name: string): string {
    return name.trim();
  }

  static isValidUserType(userType: string): boolean {
    return ['client', 'professional', 'business'].includes(userType);
  }
}
