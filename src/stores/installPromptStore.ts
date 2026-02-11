import { create } from 'zustand';

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };

interface InstallPromptState {
  /** The native install prompt event; set when beforeinstallprompt fires. */
  installPrompt: BeforeInstallPromptEvent | null;
  setInstallPrompt: (e: BeforeInstallPromptEvent | null) => void;
  /** True after user has installed or dismissed; don't show again. */
  dismissedOrInstalled: boolean;
  setDismissedOrInstalled: (v: boolean) => void;
}

export const useInstallPromptStore = create<InstallPromptState>((set) => ({
  installPrompt: null,
  setInstallPrompt: (installPrompt) => set({ installPrompt }),
  dismissedOrInstalled: false,
  setDismissedOrInstalled: (dismissedOrInstalled) => set({ dismissedOrInstalled }),
}));

export function initInstallPromptListener(): () => void {
  const handler = (e: Event) => {
    e.preventDefault();
    useInstallPromptStore.getState().setInstallPrompt(e as BeforeInstallPromptEvent);
  };
  window.addEventListener('beforeinstallprompt', handler);
  return () => window.removeEventListener('beforeinstallprompt', handler);
}
