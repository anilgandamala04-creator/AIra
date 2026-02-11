/**
 * Firebase client for auth, Firestore, Storage, and Analytics.
 * Uses VITE_FIREBASE_* env vars when set; otherwise uses project defaults below.
 */

import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyB9LROBc0oD6-u4tAoH0d45joQ61Q2Qirw',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'airaedtech-48213.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'airaedtech-48213',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'airaedtech-48213.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '302944772122',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:302944772122:web:70b24b4b17e029fce471a3',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? 'G-FYTRT700R5',
};

const hasFirebase = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.storageBucket &&
  firebaseConfig.appId
);

if (!hasFirebase) {
  console.warn(
    '[Firebase] VITE_FIREBASE_* env vars are missing or incomplete. Auth and persistence will be disabled.'
  );
}

const app = hasFirebase ? initializeApp(firebaseConfig) : (null as unknown as ReturnType<typeof initializeApp>);
export const auth = hasFirebase ? getAuth(app) : (null as unknown as ReturnType<typeof getAuth>);
export const db = hasFirebase ? getFirestore(app) : (null as unknown as ReturnType<typeof getFirestore>);
export const storage = hasFirebase ? getStorage(app) : (null as unknown as ReturnType<typeof getStorage>);
export const analytics = hasFirebase && typeof window !== 'undefined' ? getAnalytics(app) : (null as unknown as ReturnType<typeof getAnalytics>);

export { hasFirebase };

/** Optional: connect to emulators when VITE_USE_FIREBASE_EMULATORS=true */
export function connectEmulatorsIfEnabled(): void {
  if (import.meta.env.VITE_USE_FIREBASE_EMULATORS !== 'true' || !hasFirebase) return;
  try {
    if (auth) connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    if (db) connectFirestoreEmulator(db, '127.0.0.1', 8080);
    if (storage) connectStorageEmulator(storage, '127.0.0.1', 9199);
  } catch (e) {
    console.warn('Firebase emulator connect failed:', e);
  }
}
