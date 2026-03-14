import * as admin from 'firebase-admin';

let initialized = false;

export class FirebaseConfig {
  static initialize(): void {
    if (initialized) return;

    try {
      // Configurar emuladores ANTES de inicializar o app
      if (process.env.FIREBASE_EMULATOR_HOST || process.env.NODE_ENV === 'development') {
        // Variáveis de ambiente padrão para emulador
        process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8081';
        process.env.FIREBASE_AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';
      }

      admin.initializeApp();

      // Configurar Firestore com settings corretos
      const firestore = admin.firestore();
      firestore.settings({ 
        ignoreUndefinedProperties: true,
        experimentalForceLongPolling: true 
      });

      initialized = true;
    } catch (error) {
      console.error('Firebase initialization error:', error);
      throw error;
    }
  }

  static getAuth(): admin.auth.Auth {
    return admin.auth();
  }

  static getFirestore(): admin.firestore.Firestore {
    return admin.firestore();
  }

  static getStorage(): admin.storage.Storage {
    return admin.storage();
  }

  static isInitialized(): boolean {
    return initialized;
  }
}
