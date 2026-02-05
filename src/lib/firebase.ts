/**
 * Firebase SDK initialization.
 * Used for Authentication, Firestore, and Storage across the app.
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

function getEnv(name: string): string {
  try {
    const v = (import.meta.env as Record<string, unknown>)[name];
    return typeof v === 'string' ? v : '';
  } catch {
    return '';
  }
}

const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY') || '',
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN') || '',
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID') || '',
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET') || '',
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID') || '',
  appId: getEnv('VITE_FIREBASE_APP_ID') || '',
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.warn('[Firebase] Missing environment variables (VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID). Auth and database features will be limited. Add a .env file with Firebase config.');
}

let app: FirebaseApp;

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0] as FirebaseApp;
  }
} catch (e) {
  console.error('[Firebase] Initialization failed. Check your .env and Firebase config.', e);
  throw e;
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Optional: connect to emulators in development
const useEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';
if (typeof window !== 'undefined' && useEmulator) {
  try {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099');
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connectStorageEmulator(storage, '127.0.0.1', 9199);
  } catch (e) {
    console.warn('[Firebase] Emulator connection failed:', e);
  }
}

export default app;
