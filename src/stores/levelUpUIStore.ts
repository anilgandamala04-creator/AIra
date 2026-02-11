import { create } from 'zustand';

interface LevelUpUIState {
    showOverlay: boolean;
    newLevel: number;
    oldLevel: number;
    showLevelUp: (levels: { level: number; oldLevel: number }) => void;
    hideLevelUp: () => void;
}

export const useLevelUpUIStore = create<LevelUpUIState>((set) => ({
    showOverlay: false,
    newLevel: 1,
    oldLevel: 1,
    showLevelUp: ({ level, oldLevel }) => set({
        showOverlay: true,
        newLevel: level,
        oldLevel
    }),
    hideLevelUp: () => set({ showOverlay: false }),
}));
