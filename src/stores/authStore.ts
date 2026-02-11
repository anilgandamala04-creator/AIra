import { create } from 'zustand';
import type { User, AuthState, UserRole } from '../types';
import { toast } from './toastStore';
import { auth, hasFirebase } from '../lib/firebase';
import { logAppEvent, ANALYTICS_EVENTS } from '../lib/analytics';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  sendEmailVerification as firebaseSendEmailVerification,
  reload,
  linkWithPopup,
  linkWithCredential,
  sendSignInLinkToEmail as firebaseSendSignInLinkToEmail,
  isSignInWithEmailLink as firebaseIsSignInWithEmailLink,
  signInWithEmailLink as firebaseSignInWithEmailLink,
  type User as FirebaseUser,
  EmailAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
} from 'firebase/auth';

interface AuthStore extends AuthState {
  pendingLoginRole: UserRole | null;
  setPendingLoginRole: (role: UserRole | null) => void;
  login: (user: User) => void;
  continueAsGuest: (role?: UserRole) => void;
  skipToDemo: () => void;
  logout: () => void;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signInWithOAuth: (provider: 'google' | 'apple') => Promise<{ error: Error | null }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error: Error | null }>;
  /** Re-authenticate before sensitive action (delete account). Returns error if failed. */
  reauthenticateForSensitiveAction: (password?: string) => Promise<{ error: Error | null }>;
  sendEmailVerification: () => Promise<{ error: Error | null }>;
  reloadUser: () => Promise<void>;
  linkWithGoogle: () => Promise<{ error: Error | null }>;
  linkWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  /** Send passwordless sign-in link to email. User clicks link to sign in. */
  sendMagicLink: (email: string) => Promise<{ error: Error | null }>;
  /** Complete sign-in from email link (call when isSignInWithEmailLink(url) is true). */
  completeMagicLinkSignIn: (email: string, emailLink?: string) => Promise<{ error: Error | null }>;
  _setAuthLoading: (loading: boolean) => void;
}

const MAGIC_LINK_EMAIL_KEY = 'aira_emailForSignIn';

function createGuestUser(role: UserRole = 'student'): User {
  const labels: Record<UserRole, string> = { student: 'Guest Student', teacher: 'Guest Teacher', admin: 'Guest Admin' };
  return {
    id: 'guest_' + Date.now(),
    email: 'guest@aitutor.demo',
    name: labels[role],
    displayName: labels[role],
    authMethod: 'guest',
    isVerified: false,
    role,
    plan: 'simple',
    createdAt: new Date().toISOString(),
  };
}

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

function mapFirebaseUserToAppUser(
  fbUser: FirebaseUser,
  role: UserRole = 'student'
): User {
  const name =
    fbUser.displayName ??
    fbUser.email?.split('@')[0] ??
    'User';
  const providerId = fbUser.providerData[0]?.providerId ?? '';
  const authMethod: User['authMethod'] =
    providerId.includes('google') ? 'google'
    : providerId.includes('apple') ? 'apple'
    : 'email';
  return {
    id: fbUser.uid,
    email: fbUser.email ?? '',
    name,
    displayName: name,
    avatar: fbUser.photoURL ?? undefined,
    authMethod,
    isVerified: fbUser.emailVerified,
    role,
    plan: 'simple',
    createdAt: fbUser.metadata.creationTime ?? new Date().toISOString(),
  };
}

export const useAuthStore = create<AuthStore>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isGuest: false,
  pendingLoginRole: null,

  setPendingLoginRole: (role) => set({ pendingLoginRole: role }),

  _setAuthLoading: (loading) => set({ isLoading: loading }),

  login: (user) => {
    logAppEvent(ANALYTICS_EVENTS.LOGIN, { method: user.authMethod ?? 'email' });
    set({
      user,
      isAuthenticated: true,
      isGuest: user.authMethod === 'guest',
    });
  },

  continueAsGuest: (role) => {
    const user = createGuestUser(role ?? get().pendingLoginRole ?? 'student');
    set({ user, isAuthenticated: true, isGuest: true });
  },

  skipToDemo: () => {
    const user = createDemoUser();
    set({ user, isAuthenticated: true, isGuest: false });
  },

  logout: async () => {
    if (hasFirebase && auth) {
      try {
        await firebaseSignOut(auth);
      } catch (e) {
        console.error('Firebase signOut error:', e);
      }
    }
    set({ user: null, isAuthenticated: false, isGuest: false });
    toast.success('Signed out successfully');
  },

  signInWithEmail: async (email, password) => {
    if (!hasFirebase || !auth) return { error: new Error('Firebase is not configured') };
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      const role = get().pendingLoginRole ?? 'student';
      const appUser = mapFirebaseUserToAppUser(user, role);
      set({ user: { ...appUser, role }, isAuthenticated: true, isGuest: false });
      return { error: null };
    } catch (e) {
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  },

  signUpWithEmail: async (email, password, displayName) => {
    if (!hasFirebase || !auth) return { error: new Error('Firebase is not configured') };
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName?.trim()) {
        try {
          await updateProfile(user, { displayName: displayName.trim() });
        } catch {
          // non-fatal
        }
      }
      try {
        await firebaseSendEmailVerification(user);
      } catch {
        // non-fatal: user is created; they can request verification from Settings
      }
      const role = get().pendingLoginRole ?? 'student';
      const appUser = mapFirebaseUserToAppUser(user, role);
      set({ user: { ...appUser, role }, isAuthenticated: true, isGuest: false });
      return { error: null };
    } catch (e) {
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  },

  sendEmailVerification: async () => {
    if (!hasFirebase || !auth?.currentUser) return { error: new Error('Not signed in') };
    try {
      await firebaseSendEmailVerification(auth.currentUser);
      return { error: null };
    } catch (e) {
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  },

  reloadUser: async () => {
    if (!hasFirebase || !auth?.currentUser) return;
    try {
      await reload(auth.currentUser);
      const fbUser = auth.currentUser;
      if (fbUser) {
        const role = get().user?.role ?? get().pendingLoginRole ?? 'student';
        const appUser = mapFirebaseUserToAppUser(fbUser, role);
        set({ user: { ...appUser, role } });
      }
    } catch (e) {
      console.error('Failed to reload user:', e);
    }
  },

  linkWithGoogle: async () => {
    if (!hasFirebase || !auth?.currentUser) return { error: new Error('Not signed in') };
    try {
      await linkWithPopup(auth.currentUser, new GoogleAuthProvider());
      await reload(auth.currentUser);
      const fbUser = auth.currentUser;
      if (fbUser) {
        const role = get().user?.role ?? get().pendingLoginRole ?? 'student';
        const appUser = mapFirebaseUserToAppUser(fbUser, role);
        set({ user: { ...appUser, role } });
      }
      return { error: null };
    } catch (e) {
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  },

  linkWithEmail: async (email, password) => {
    if (!hasFirebase || !auth?.currentUser) return { error: new Error('Not signed in') };
    try {
      const cred = EmailAuthProvider.credential(email, password);
      await linkWithCredential(auth.currentUser, cred);
      await reload(auth.currentUser);
      const fbUser = auth.currentUser;
      if (fbUser) {
        const role = get().user?.role ?? get().pendingLoginRole ?? 'student';
        const appUser = mapFirebaseUserToAppUser(fbUser, role);
        set({ user: { ...appUser, role } });
      }
      return { error: null };
    } catch (e) {
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  },

  sendMagicLink: async (email) => {
    if (!hasFirebase || !auth) return { error: new Error('Firebase is not configured') };
    try {
      const actionCodeSettings = {
        url: typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '',
        handleCodeInApp: true,
      };
      await firebaseSendSignInLinkToEmail(auth, email.trim(), actionCodeSettings);
      if (typeof window !== 'undefined') window.localStorage.setItem(MAGIC_LINK_EMAIL_KEY, email.trim());
      return { error: null };
    } catch (e) {
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  },

  completeMagicLinkSignIn: async (email, emailLink) => {
    if (!hasFirebase || !auth) return { error: new Error('Firebase is not configured') };
    try {
      const link = emailLink ?? (typeof window !== 'undefined' ? window.location.href : '');
      const { user } = await firebaseSignInWithEmailLink(auth, email.trim(), link);
      if (typeof window !== 'undefined') window.localStorage.removeItem(MAGIC_LINK_EMAIL_KEY);
      const role = get().pendingLoginRole ?? 'student';
      const appUser = mapFirebaseUserToAppUser(user, role);
      set({ user: { ...appUser, role }, isAuthenticated: true, isGuest: false });
      return { error: null };
    } catch (e) {
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  },

  signInWithOAuth: async (provider) => {
    if (!hasFirebase || !auth) return { error: new Error('Firebase is not configured') };
    try {
      const prov =
        provider === 'apple'
          ? new OAuthProvider('apple.com')
          : new GoogleAuthProvider();
      if (provider === 'apple') {
        prov.addScope('name');
        prov.addScope('email');
      }
      await signInWithPopup(auth, prov);
      const fbUser = auth.currentUser;
      if (fbUser) {
        const role = get().pendingLoginRole ?? 'student';
        const appUser = mapFirebaseUserToAppUser(fbUser, role);
        set({ user: { ...appUser, role }, isAuthenticated: true, isGuest: false });
      }
      return { error: null };
    } catch (e) {
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    if (!hasFirebase || !auth?.currentUser?.email) {
      return { error: new Error('Not signed in with email') };
    }
    try {
      const fbUser = auth.currentUser;
      const email = fbUser.email;
      if (!email) return { error: new Error('No email for this account') };
      const cred = EmailAuthProvider.credential(email, currentPassword);
      await reauthenticateWithCredential(fbUser, cred);
      await updatePassword(fbUser, newPassword);
      return { error: null };
    } catch (e) {
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  },

  reauthenticateForSensitiveAction: async (password) => {
    if (!hasFirebase || !auth?.currentUser) return { error: new Error('Not signed in') };
    const fbUser = auth.currentUser;
    const providerId = fbUser.providerData[0]?.providerId ?? '';
    if (providerId.includes('google') || providerId.includes('apple')) {
      try {
        const provider = providerId.includes('apple') ? new OAuthProvider('apple.com') : new GoogleAuthProvider();
        await reauthenticateWithPopup(fbUser, provider);
        return { error: null };
      } catch (e) {
        return { error: e instanceof Error ? e : new Error(String(e)) };
      }
    }
    const email = fbUser.email;
    if (!password || !email) return { error: new Error('Enter your password to continue') };
    try {
      const cred = EmailAuthProvider.credential(email, password);
      await reauthenticateWithCredential(fbUser, cred);
      return { error: null };
    } catch (e) {
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  },
}));

/** Max time to block UI on auth session check; after this we show shell and update when session arrives. */
const AUTH_LOAD_CAP_MS = 220;

/**
 * If the current URL is an email sign-in link, complete sign-in and return true.
 * Call once on app load (e.g. from App useEffect).
 */
export async function tryCompleteMagicLinkSignIn(): Promise<boolean> {
  if (!hasFirebase || !auth || typeof window === 'undefined') return false;
  if (!firebaseIsSignInWithEmailLink(auth, window.location.href)) return false;
  const email = window.localStorage.getItem(MAGIC_LINK_EMAIL_KEY);
  if (!email) return false;
  const { completeMagicLinkSignIn } = useAuthStore.getState();
  const { error } = await completeMagicLinkSignIn(email, window.location.href);
  if (error) {
    console.error('Magic link sign-in failed:', error);
    return false;
  }
  window.history.replaceState(null, '', window.location.pathname + window.location.hash);
  return true;
}

/**
 * Initialize auth listener. With Firebase: subscribes to auth state and syncs to store.
 * Without Firebase: no-op and sets isLoading false (guest/demo only).
 */
export function initAuthListener(): () => void {
  if (!hasFirebase || !auth) {
    useAuthStore.getState()._setAuthLoading(false);
    return () => {};
  }

  let capTimer: ReturnType<typeof setTimeout> | null = setTimeout(() => {
    capTimer = null;
    useAuthStore.getState()._setAuthLoading(false);
  }, AUTH_LOAD_CAP_MS);

  const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
    if (capTimer) {
      clearTimeout(capTimer);
      capTimer = null;
    }
    if (fbUser) {
      const role = useAuthStore.getState().pendingLoginRole ?? 'student';
      const appUser = mapFirebaseUserToAppUser(fbUser, role);
      useAuthStore.getState().login({ ...appUser, role });
    } else {
      useAuthStore.getState()._setAuthLoading(false);
      useAuthStore.setState({ user: null, isAuthenticated: false });
    }
  });

  return () => {
    if (capTimer) clearTimeout(capTimer);
    unsubscribe();
  };
}
