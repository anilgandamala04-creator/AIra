import { create } from 'zustand';
import type { Achievement } from '../types';

interface AchievementUIState {
    activeAchievement: Achievement | null;
    showOverlay: boolean;
    queue: Achievement[];

    // Actions
    showUnlock: (achievement: Achievement) => void;
    hideUnlock: () => void;
    processQueue: () => void;
}

export const useAchievementUIStore = create<AchievementUIState>()((set, get) => ({
    activeAchievement: null,
    showOverlay: false,
    queue: [],

    showUnlock: (achievement) => {
        const { showOverlay, queue } = get();
        if (showOverlay) {
            set({ queue: [...queue, achievement] });
        } else {
            set({ activeAchievement: achievement, showOverlay: true });
        }
    },

    hideUnlock: () => {
        set({ showOverlay: false, activeAchievement: null });
        // Small delay before processing next in queue for smoothness
        setTimeout(() => {
            get().processQueue();
        }, 500);
    },

    processQueue: () => {
        const { queue } = get();
        if (queue.length > 0) {
            const next = queue[0];
            const remaining = queue.slice(1);
            set({ activeAchievement: next, showOverlay: true, queue: remaining });
        }
    }
}));
