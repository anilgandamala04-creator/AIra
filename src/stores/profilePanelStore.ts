import { create } from 'zustand';

interface ProfilePanelStore {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
}

export const useProfilePanelStore = create<ProfilePanelStore>((set) => ({
    isOpen: false,
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
    toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}));
