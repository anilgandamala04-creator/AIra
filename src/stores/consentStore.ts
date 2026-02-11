/**
 * Cookie / consent store for GDPR-style analytics and marketing consent.
 * Persists to localStorage; analytics is only enabled when user accepts.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const CONSENT_KEY = 'aira_consent';

export interface ConsentState {
  analytics: boolean;
  marketing?: boolean;
  hasConsented: boolean; // true once user made a choice (accept or decline)
}

interface ConsentStore extends ConsentState {
  setConsent: (analytics: boolean, marketing?: boolean) => void;
}

const defaultState: ConsentState = {
  analytics: false,
  marketing: false,
  hasConsented: false,
};

export const useConsentStore = create<ConsentStore>()(
  persist(
    (set) => ({
      ...defaultState,
      setConsent: (analytics, marketing = false) => set({ analytics, marketing, hasConsented: true }),
    }),
    { name: CONSENT_KEY }
  )
);
