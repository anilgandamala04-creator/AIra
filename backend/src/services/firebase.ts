import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });

let app: admin.app.App | null = null;
let hasCredentials = false;
let initialized = false;

function getFirebaseApp(): admin.app.App | null {
  if (initialized) return app;
  initialized = true;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    hasCredentials = true;
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    app = admin.initializeApp();
    hasCredentials = true;
  } else {
    console.warn('[Firebase Admin] No credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY or GOOGLE_APPLICATION_CREDENTIALS. Auth verification will treat all tokens as invalid.');
  }

  return app;
}

export function getAuth(): admin.auth.Auth | null {
  const a = getFirebaseApp();
  return a ? a.auth() : null;
}

export async function verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken | null> {
  if (!hasCredentials && !getFirebaseApp()) return null;
  const auth = getAuth();
  if (!auth) return null;
  try {
    return await auth.verifyIdToken(idToken);
  } catch {
    return null;
  }
}
