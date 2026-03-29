import * as admin from 'firebase-admin';

// ⭐ DEVE SER SETADO ANTES de qualquer admin.initializeApp()
// O Firebase CLI seta FUNCTIONS_EMULATOR=true em todos os processos emulados
if (process.env.FUNCTIONS_EMULATOR === 'true') {
  process.env.FIRESTORE_EMULATOR_HOST =
    process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8081';
  process.env.FIREBASE_AUTH_EMULATOR_HOST =
    process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';
  console.log('[FirebaseConfig] Emulator mode detected');
  console.log('  FIRESTORE_EMULATOR_HOST  =', process.env.FIRESTORE_EMULATOR_HOST);
  console.log('  FIREBASE_AUTH_EMULATOR_HOST =', process.env.FIREBASE_AUTH_EMULATOR_HOST);
}

let initialized = false;

export class FirebaseConfig {
  static initialize(): void {
    if (initialized) return;

    try {
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
