import { create } from 'zustand';
import { auth } from '../lib/firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import type { User, AuthState } from '../types';
import {
  signInWithGoogle as authSignInWithGoogle,
  signInWithApple as authSignInWithApple,
  signInWithEmail as authSignInWithEmail,
  signUpWithEmail as authSignUpWithEmail,
  sendPasswordReset,
  signOutUser,
  updateUserPassword,
} from '../services/authService';
import { toast } from './toastStore';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthStore extends AuthState {
  login: (user: User) => void;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  continueAsGuest: () => void;
  skipToDemo: () => void;
  logout: () => Promise<void>;
  recoverPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  _setUserFromFirebase: (user: User | null) => void;
  _setAuthLoading: (loading: boolean) => void;
  _clearIfNotGuest: () => void;
}

function mapFirebaseUser(fb: FirebaseUser, authMethod: User['authMethod']): User {
  const displayName =
    fb.displayName ||
    (fb.providerData?.[0] as { displayName?: string } | undefined)?.displayName ||
    fb.email?.split('@')[0] ||
    'User';
  const photoURL = fb.photoURL || (fb.providerData?.[0] as { photoURL?: string } | undefined)?.photoURL;
  return {
    id: fb.uid,
    email: fb.email ?? '',
    name: displayName,
    displayName,
    avatar: photoURL ?? undefined,
    authMethod,
    isVerified: !!fb.emailVerified,
    role: 'student',
    plan: 'simple',
    createdAt: fb.metadata.creationTime ?? new Date().toISOString(),
  };
}

function getAuthMethodFromFirebase(fb: FirebaseUser): User['authMethod'] {
  const providerId = fb.providerData?.[0]?.providerId ?? '';
  if (providerId.includes('google')) return 'google';
  if (providerId.includes('apple')) return 'apple';
  return 'email';
}

const createGuestUser = (): User => ({
  id: 'guest_' + Date.now(),
  email: 'guest@aitutor.demo',
  name: 'Guest User',
  displayName: 'Guest',
  authMethod: 'guest',
  isVerified: false,
  role: 'student',
  plan: 'simple',
  createdAt: new Date().toISOString(),
});

const createDemoUser = (): User => ({
  id: 'demo_user_123',
  email: 'demo@aitutor.app',
  name: 'Demo User',
  displayName: 'Demo',
  authMethod: 'email',
  isVerified: true,
  role: 'student',
  plan: 'pro',
  createdAt: new Date().toISOString(),
});

export const useAuthStore = create<AuthStore>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isGuest: false,

  _setUserFromFirebase: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isGuest: false,
    }),

  _setAuthLoading: (loading) => set({ isLoading: loading }),

  _clearIfNotGuest: () =>
    set((state) => {
      if (state.isGuest) return state;
      return { user: null, isAuthenticated: false, isGuest: false };
    }),

  login: (user) =>
    set({
      user,
      isAuthenticated: true,
      isGuest: user.authMethod === 'guest',
    }),

  loginWithGoogle: async () => {
    set({ isLoading: true });
    try {
      const result = await authSignInWithGoogle();
      if (result.success && result.user) {
        const user = mapFirebaseUser(result.user, 'google');
        set({ user, isAuthenticated: true, isLoading: false, isGuest: false });
        toast.success('Signed in with Google successfully!');
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            window.dispatchEvent(
              new CustomEvent('auth:login-success', { detail: { user } })
            );
          }, 100);
        }
      } else if (result.error) {
        set({ isLoading: false });
        toast.error(result.error.userMessage);
        const e = new Error(result.error.userMessage) as Error & { code?: string };
        e.code = result.error.code;
        throw e;
      }
    } catch (error) {
      console.error('Google login failed:', error);
      set({ isLoading: false });
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to sign in with Google. Please try again.';
      if (!errorMessage.includes('toast')) toast.error(errorMessage);
      throw error;
    }
  },

  loginWithApple: async () => {
    set({ isLoading: true });
    try {
      const result = await authSignInWithApple();
      if (result.success && result.user) {
        const user = mapFirebaseUser(result.user, 'apple');
        set({ user, isAuthenticated: true, isLoading: false, isGuest: false });
        toast.success('Signed in with Apple successfully!');
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            window.dispatchEvent(
              new CustomEvent('auth:login-success', { detail: { user } })
            );
          }, 100);
        }
      } else if (result.error) {
        set({ isLoading: false });
        toast.error(result.error.userMessage);
        const e = new Error(result.error.userMessage) as Error & { code?: string };
        e.code = result.error.code;
        throw e;
      }
    } catch (error) {
      console.error('Apple login failed:', error);
      set({ isLoading: false });
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to sign in with Apple. Please try again.';
      if (!errorMessage.includes('toast')) toast.error(errorMessage);
      throw error;
    }
  },

  loginWithEmail: async (email, password) => {
    set({ isLoading: true });
    try {
      const result = await authSignInWithEmail(email, password);
      if (result.success && result.user) {
        const user = mapFirebaseUser(result.user, 'email');
        set({ user, isAuthenticated: true, isLoading: false, isGuest: false });
        toast.success('Signed in successfully!');
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            window.dispatchEvent(
              new CustomEvent('auth:login-success', { detail: { user } })
            );
          }, 100);
        }
      } else if (result.error) {
        set({ isLoading: false });
        const errorMsg = result.error.userMessage || 'Failed to sign in. Please check your credentials.';
        toast.error(errorMsg);
        const e = new Error(errorMsg) as Error & { code?: string };
        e.code = result.error.code;
        throw e;
      }
    } catch (error) {
      console.error('Email login failed:', error);
      set({ isLoading: false });
      if (!(error instanceof Error && error.message.includes('toast'))) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to sign in. Please try again.'
        );
      }
      throw error;
    }
  },

  signUpWithEmail: async (email, password, name) => {
    set({ isLoading: true });
    try {
      const result = await authSignUpWithEmail(email, password, name);
      if (result.success && result.user) {
        const user = mapFirebaseUser(result.user, 'email');
        user.name = name;
        user.displayName = name;
        set({ user, isAuthenticated: true, isLoading: false, isGuest: false });
        toast.success('Account created successfully! Please check your email to verify.');

        if (typeof window !== 'undefined') {
          setTimeout(() => {
            window.dispatchEvent(
              new CustomEvent('auth:signup-success', { detail: { user, isNewUser: true } })
            );
          }, 100);
        }
      } else if (result.error) {
        set({ isLoading: false });
        toast.error(result.error.userMessage);
        const e = new Error(result.error.userMessage) as Error & { code?: string };
        e.code = result.error.code;
        throw e;
      }
    } catch (error) {
      console.error('Email signup failed:', error);
      set({ isLoading: false });
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create account. Please try again.';
      if (!errorMessage.includes('toast')) toast.error(errorMessage);
      throw error;
    }
  },

  continueAsGuest: () => {
    const user = createGuestUser();
    set({ user, isAuthenticated: true, isGuest: true });
  },

  skipToDemo: () => {
    const user = createDemoUser();
    set({ user, isAuthenticated: true, isGuest: false });
  },

  logout: async () => {
    const state = get();
    if (!state.isGuest) {
      try {
        await signOutUser();
      } catch (e) {
        console.error('Firebase signOut error:', e);
      }
    }
    set({ user: null, isAuthenticated: false, isGuest: false });
    toast.success('Signed out successfully');
  },

  recoverPassword: async (email) => {
    try {
      const result = await sendPasswordReset(email);
      if (result.success) {
        toast.success('Password reset email sent! Please check your inbox.');
      } else if (result.error) {
        toast.error(result.error.userMessage);
        throw new Error(result.error.userMessage);
      }
    } catch (error) {
      console.error('Password recovery failed:', error);
      throw error;
    }
  },

  resetPassword: async (_token, newPassword) => {
    set({ isLoading: true });
    try {
      const result = await updateUserPassword(newPassword);
      if (result.success) {
        toast.success('Password updated successfully!');
        set({ isLoading: false });
      } else {
        set({ isLoading: false });
        toast.error(result.error?.userMessage ?? 'Failed to reset password.');
        throw new Error(result.error?.userMessage);
      }
    } catch (error) {
      console.error('Password reset failed:', error);
      set({ isLoading: false });
      toast.error(error instanceof Error ? error.message : 'Failed to reset password.');
      throw error;
    }
  },
}));

/** Subscribe to Firebase Auth state and sync to store. */
export function initAuthListener(): () => void {
  const handleUser = (fbUser: FirebaseUser | null) => {
    const store = useAuthStore.getState();
    store._setAuthLoading(false);
    if (fbUser) {
      const authMethod = getAuthMethodFromFirebase(fbUser);
      store._setUserFromFirebase(mapFirebaseUser(fbUser, authMethod));
    } else {
      store._clearIfNotGuest();
    }
  };

  const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
    handleUser(fbUser);
  });

  return () => unsubscribe();
}
