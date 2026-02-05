/**
 * Authentication Service (Firebase)
 *
 * Provides authentication flows for:
 * - Google Sign-in
 * - Apple Sign-in
 * - Email/Password authentication
 * - Password reset
 *
 * Features:
 * - Automatic retry with exponential backoff
 * - Network error detection and recovery
 * - Detailed error messages for users
 */

import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  updatePassword,
  GoogleAuthProvider,
  OAuthProvider,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

// ============================================================================
// Types
// ============================================================================

export type AuthProvider = 'google' | 'apple' | 'email';

export interface AuthResult {
  success: boolean;
  user?: FirebaseUser | null;
  error?: AuthErrorDetails;
}

export interface AuthErrorDetails {
  code: string;
  message: string;
  userMessage: string;
  recoverable: boolean;
  suggestedAction?: string;
}

// ============================================================================
// Error Handling
// ============================================================================

const AUTH_ERROR_MESSAGES: Record<string, { message: string; recoverable: boolean; action?: string }> = {
  'auth/invalid-credential': {
    message: 'Invalid email or password. Please check your credentials.',
    recoverable: true,
    action: 'retry',
  },
  'auth/user-not-found': {
    message: 'No account found with this email. Please sign up first.',
    recoverable: true,
    action: 'signup',
  },
  'auth/email-not-verified': {
    message: 'Please verify your email address before signing in.',
    recoverable: true,
    action: 'verify-email',
  },
  'auth/network-request-failed': {
    message: 'Network connection failed. Please check your internet connection.',
    recoverable: true,
    action: 'retry',
  },
  'auth/popup-blocked': {
    message: 'Sign-in popup was blocked. Please allow popups and try again.',
    recoverable: true,
    action: 'retry',
  },
  'auth/popup-closed-by-user': {
    message: 'Sign-in was cancelled.',
    recoverable: true,
    action: 'retry',
  },
  'auth/cancelled-popup-request': {
    message: 'Only one sign-in request can be in progress at a time.',
    recoverable: true,
    action: 'retry',
  },
  'auth/too-many-requests': {
    message: 'Too many sign-in attempts. Please wait 5–10 minutes and try again.',
    recoverable: true,
    action: 'wait-and-retry',
  },
  'auth/operation-not-allowed': {
    message: 'This sign-in method is not enabled. Contact support.',
    recoverable: false,
    action: 'contact-admin',
  },
};

function parseAuthError(error: unknown): AuthErrorDetails {
  const err = error as { code?: string; message?: string } | null | undefined;
  const code = err?.code ?? 'unknown';
  const message = (err?.message ?? 'An unknown error occurred').toString();
  const lower = message.toLowerCase();

  const knownError = AUTH_ERROR_MESSAGES[code];
  if (knownError) {
    return {
      code,
      message,
      userMessage: knownError.message,
      recoverable: knownError.recoverable,
      suggestedAction: knownError.action,
    };
  }

  if (lower.includes('network') || lower.includes('failed to fetch')) {
    return {
      code: 'network_error',
      message,
      userMessage: 'Network error. Please check your connection.',
      recoverable: true,
      suggestedAction: 'retry',
    };
  }

  return {
    code,
    message,
    userMessage: message || 'Something went wrong. Please try again.',
    recoverable: true,
    suggestedAction: 'retry',
  };
}

// ============================================================================
// Retry Logic
// ============================================================================

async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const authError = parseAuthError(error);

      if (authError.code === 'auth/too-many-requests' || !authError.recoverable) {
        throw error;
      }
      if (attempt < maxRetries - 1) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }

  throw lastError;
}

// ============================================================================
// Google Authentication
// ============================================================================

export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return {
      success: true,
      user: result.user,
    };
  } catch (error) {
    console.error('Google sign-in error:', error);
    return {
      success: false,
      error: parseAuthError(error),
    };
  }
}

// ============================================================================
// Apple Authentication
// ============================================================================

export async function signInWithApple(): Promise<AuthResult> {
  try {
    const provider = new OAuthProvider('apple.com');
    const result = await signInWithPopup(auth, provider);
    return {
      success: true,
      user: result.user,
    };
  } catch (error) {
    console.error('Apple sign-in error:', error);
    return {
      success: false,
      error: parseAuthError(error),
    };
  }
}

// ============================================================================
// Email/Password Authentication
// ============================================================================

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  try {
    const trimmedEmail = email.trim().toLowerCase();

    const userCredential = await withRetry(
      () => signInWithEmailAndPassword(auth, trimmedEmail, password),
      2
    );

    return {
      success: true,
      user: userCredential.user,
    };
  } catch (error) {
    console.error('Email sign-in error:', error);
    return {
      success: false,
      error: parseAuthError(error),
    };
  }
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<AuthResult> {
  try {
    const trimmedEmail = email.trim().toLowerCase();

    const userCredential = await withRetry(
      () => createUserWithEmailAndPassword(auth, trimmedEmail, password),
      2
    );

    // Update display name via profile (Firebase Auth doesn't set displayName in createUserWithEmailAndPassword)
    if (userCredential.user) {
      const { updateProfile } = await import('firebase/auth');
      await updateProfile(userCredential.user, { displayName: displayName.trim() || undefined });
    }

    return {
      success: true,
      user: userCredential.user,
    };
  } catch (error) {
    console.error('Email sign-up error:', error);
    return {
      success: false,
      error: parseAuthError(error),
    };
  }
}

// ============================================================================
// Password Recovery
// ============================================================================

export async function sendPasswordReset(email: string): Promise<AuthResult> {
  try {
    const actionCodeSettings = {
      url: `${window.location.origin}/login`,
      handleCodeInApp: false,
    };
    await withRetry(
      () => sendPasswordResetEmail(auth, email.trim().toLowerCase(), actionCodeSettings),
      2
    );
    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    return {
      success: false,
      error: parseAuthError(error),
    };
  }
}

// ============================================================================
// Sign Out
// ============================================================================

export async function signOutUser(): Promise<AuthResult> {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Sign-out error:', error);
    return {
      success: false,
      error: parseAuthError(error),
    };
  }
}

// ============================================================================
// Session / Current User (Firebase handles persistence automatically)
// ============================================================================

export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}

/** No redirect result for Firebase popup flow; session is set synchronously after popup. */
export async function handleRedirectResult(): Promise<AuthResult | null> {
  const user = auth.currentUser;
  if (user) {
    return { success: true, user };
  }
  return null;
}

export async function setSessionPersistence(_rememberMe: boolean): Promise<void> {
  // Firebase uses browser persistence by default; no-op for compatibility
}

// ============================================================================
// Update password (for signed-in user, e.g. settings or post-reset)
// ============================================================================

export async function updateUserPassword(newPassword: string): Promise<AuthResult> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return {
        success: false,
        error: {
          code: 'auth/no-user',
          message: 'Not signed in',
          userMessage: 'Please sign in to update your password.',
          recoverable: true,
        },
      };
    }
    await updatePassword(user, newPassword);
    return { success: true };
  } catch (error) {
    console.error('Update password error:', error);
    return {
      success: false,
      error: parseAuthError(error),
    };
  }
}
