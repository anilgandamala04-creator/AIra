import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthState } from '../types';

interface AuthStore extends AuthState {
    login: (user: User) => void;
    loginWithGoogle: () => Promise<void>;
    loginWithApple: () => Promise<void>;
    loginWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
    continueAsGuest: () => void;
    skipToDemo: () => void;
    logout: () => void;
    recoverPassword: (email: string) => Promise<void>;
    resetPassword: (token: string, newPassword: string) => Promise<void>;
}

// Mock user for demo/guest
const createGuestUser = (): User => ({
    id: 'guest_' + Date.now(),
    email: 'guest@aitutor.demo',
    name: 'Guest User',
    displayName: 'Guest',
    authMethod: 'guest',
    isVerified: false,
    createdAt: new Date().toISOString(),
});

const createDemoUser = (): User => ({
    id: 'demo_user_123',
    email: 'demo@aitutor.app',
    name: 'Demo User',
    displayName: 'Demo',
    authMethod: 'email',
    isVerified: true,
    createdAt: new Date().toISOString(),
});

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isGuest: false,

            login: (user) => set({
                user,
                isAuthenticated: true,
                isGuest: user.authMethod === 'guest'
            }),

            loginWithGoogle: async () => {
                set({ isLoading: true });
                try {
                    // Simulate OAuth delay
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    const user: User = {
                        id: 'google_' + Date.now(),
                        email: 'user@gmail.com',
                        name: 'Google User',
                        displayName: 'Google User',
                        avatar: 'https://ui-avatars.com/api/?name=Google+User&background=random',
                        authMethod: 'google',
                        isVerified: true,
                        createdAt: new Date().toISOString(),
                    };
                    set({ user, isAuthenticated: true, isLoading: false, isGuest: false });
                } catch (error) {
                    console.error('Google login failed:', error);
                    set({ isLoading: false });
                    throw error;
                }
            },

            loginWithApple: async () => {
                set({ isLoading: true });
                try {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    const user: User = {
                        id: 'apple_' + Date.now(),
                        email: 'user@privaterelay.appleid.com',
                        name: 'Apple User',
                        displayName: 'Apple User',
                        authMethod: 'apple',
                        isVerified: true,
                        createdAt: new Date().toISOString(),
                    };
                    set({ user, isAuthenticated: true, isLoading: false, isGuest: false });
                } catch (error) {
                    console.error('Apple login failed:', error);
                    set({ isLoading: false });
                    throw error;
                }
            },

            loginWithEmail: async (email, _password) => {
                // Password parameter required by interface but not used in mock implementation
                void _password; // Explicitly mark as intentionally unused
                set({ isLoading: true });
                try {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    const user: User = {
                        id: 'email_' + Date.now(),
                        email,
                        name: email.split('@')[0],
                        displayName: email.split('@')[0],
                        authMethod: 'email',
                        isVerified: true,
                        createdAt: new Date().toISOString(),
                    };
                    set({ user, isAuthenticated: true, isLoading: false, isGuest: false });
                } catch (error) {
                    console.error('Email login failed:', error);
                    set({ isLoading: false });
                    throw error;
                }
            },

            signUpWithEmail: async (email, _password, name) => {
                // Password parameter kept for interface compatibility but not used in mock
                void _password; // Explicitly mark as intentionally unused
                set({ isLoading: true });
                try {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    const user: User = {
                        id: 'email_' + Date.now(),
                        email,
                        name,
                        displayName: name,
                        authMethod: 'email',
                        isVerified: false,
                        createdAt: new Date().toISOString(),
                    };
                    set({ user, isAuthenticated: true, isLoading: false, isGuest: false });
                } catch (error) {
                    console.error('Email signup failed:', error);
                    set({ isLoading: false });
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

            logout: () => set({
                user: null,
                isAuthenticated: false,
                isGuest: false
            }),

            recoverPassword: async (_email) => {
                // Email parameter required by interface but not used in mock implementation
                void _email; // Explicitly mark as intentionally unused
                try {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    // Mock: email sent
                } catch (error) {
                    console.error('Password recovery failed:', error);
                    throw error;
                }
            },

            resetPassword: async (_token, _newPassword) => {
                // Token and password parameters required by interface but not used in mock implementation
                void _token; // Explicitly mark as intentionally unused
                void _newPassword; // Explicitly mark as intentionally unused
                try {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    // Mock: password reset
                } catch (error) {
                    console.error('Password reset failed:', error);
                    throw error;
                }
            },
        }),
        {
            name: 'ai-tutor-auth',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
                isGuest: state.isGuest,
            }),
        }
    )
);
