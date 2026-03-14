import * as logger from 'firebase-functions/logger';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export class AppLogger {
  private static maskSensitiveData(data: unknown): unknown {
    if (typeof data === 'string') {
      // Mascara emails, senhas, tokens
      return data
        .replace(/[\w\.-]+@[\w\.-]+\.\w+/g, '[EMAIL_MASKED]')
        .replace(/password['":\s]+["']?[^"'\s,}]+/gi, 'password: [MASKED]')
        .replace(/token['":\s]+["']?[^"'\s,}]+/gi, 'token: [MASKED]');
    }

    if (typeof data === 'object' && data !== null) {
      const masked: any = Array.isArray(data) ? [...data] : { ...data };

      for (const key in masked) {
        if (
          key.toLowerCase().includes('password') ||
          key.toLowerCase().includes('token') ||
          key.toLowerCase().includes('email') ||
          key.toLowerCase().includes('secret')
        ) {
          masked[key] = '[MASKED]';
        } else {
          masked[key] = this.maskSensitiveData(masked[key]);
        }
      }

      return masked;
    }

    return data;
  }

  static debug(message: string, data?: unknown): void {
    logger.debug(message, { data: this.maskSensitiveData(data) });
  }

  static info(message: string, data?: unknown): void {
    logger.info(message, { data: this.maskSensitiveData(data) });
  }

  static warn(message: string, data?: unknown): void {
    logger.warn(message, { data: this.maskSensitiveData(data) });
  }

  static error(message: string, error?: unknown, context?: unknown): void {
    const errorData = error instanceof Error ? error.message : String(error);
    logger.error(message, {
      error: this.maskSensitiveData(errorData),
      context: this.maskSensitiveData(context),
    });
  }

  static logAuth(action: string, uid?: string, additional?: Record<string, any>): void {
    this.info(`AUTH_${action}`, { uid, ...additional });
  }
}
