import { create } from 'zustand';
import type {
    Achievement,
    SessionAnalytics,
    ProgressMetrics
} from '../types';
import { useAuthStore } from './authStore';
import { updateUserAnalytics as syncAnalyticsToBackend } from '../services/backendService';
import { realTimeEvents, EVENTS } from '../utils/realTimeSync';

interface AnalyticsStore {
    sessions: SessionAnalytics[];
    achievements: Achievement[];
    metrics: ProgressMetrics;

    // Actions
    addSession: (session: SessionAnalytics) => void;
    updateMetrics: () => void;
    checkAchievements: () => void;
    unlockAchievement: (id: string) => void;
}

const initialAchievements: Achievement[] = [
    {
        id: 'first_step',
        name: 'First Step',
        description: 'Complete your first learning session',
        icon: '🎯',
        target: 1,
        progress: 0,
    },
    {
        id: 'quick_learner',
        name: 'Quick Learner',
        description: 'Complete a topic with >90% quiz score',
        icon: '⚡',
        target: 1,
        progress: 0,
    },
    {
        id: 'dedicated_student',
        name: 'Dedicated Student',
        description: 'Study for more than 5 hours total',
        icon: '📚',
        target: 300, // minutes
        progress: 0,
    },
    {
        id: 'streak_master',
        name: 'Streak Master',
        description: 'Maintain a 3-day learning streak',
        icon: '🔥',
        target: 3,
        progress: 0,
    }
];

export const useAnalyticsStore = create<AnalyticsStore>()((set, get) => ({
    // All data is loaded from Firestore - initialize with empty state
    sessions: [],
    achievements: initialAchievements, // Achievements structure is static, but progress is from Firestore
    metrics: {
        totalHours: 0,
        topicsCompleted: 0,
        averageQuizScore: 0,
        knowledgeRetention: 0,
        weeklyHours: [0, 0, 0, 0, 0, 0, 0],
        streakDays: 0,
    },

    addSession: (session) => {
        set((state) => ({
            sessions: [...state.sessions, session]
        }));
        // Emit real-time event immediately for instant UI updates
        realTimeEvents.emit(EVENTS.SESSION_RECORDED, session);
        get().updateMetrics();
        get().checkAchievements();
        const { user, isGuest } = useAuthStore.getState();
        if (user?.id && !isGuest) {
            const s = get();
            syncAnalyticsToBackend(user.id, { sessions: s.sessions, achievements: s.achievements, metrics: s.metrics }).catch((e: Error) => console.error('Backend sync analytics:', e));
        }
    },

    updateMetrics: () => {
        const { sessions } = get();
        const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
        const completedSessions = sessions.filter(s => s.completionPercentage === 100);
        const totalScore = sessions.reduce((acc, s) => acc + (s.quizScore || 0), 0);

        set((state) => ({
            metrics: {
                ...state.metrics,
                totalHours: Math.round((totalMinutes / 60) * 10) / 10,
                topicsCompleted: completedSessions.length,
                averageQuizScore: sessions.length ? Math.round(totalScore / sessions.length) : 0,
            }
        }));
    },

    checkAchievements: () => {
        // Placeholder: achievement unlock logic (e.g. first_step, streak_master) can be
        // implemented here using get().sessions and get().metrics. addSession already calls this.
    },

    unlockAchievement: (id) => {
        let unlockedAchievement: Achievement | undefined;
        set((state) => {
            const updated = state.achievements.map(a => {
                if (a.id === id && !a.unlockedAt) {
                    unlockedAchievement = { ...a, unlockedAt: new Date().toISOString(), progress: a.target };
                    return unlockedAchievement;
                }
                return a;
            });
            return { achievements: updated };
        });
        // Emit real-time event immediately for instant UI updates
        if (unlockedAchievement) {
            realTimeEvents.emit(EVENTS.ACHIEVEMENT_UNLOCKED, unlockedAchievement);
        }
        const { user, isGuest } = useAuthStore.getState();
        if (user?.id && !isGuest) {
            const s = get();
            syncAnalyticsToBackend(user.id, { sessions: s.sessions, achievements: s.achievements, metrics: s.metrics }).catch((e: Error) => console.error('Backend sync analytics:', e));
        }
    }
}));
