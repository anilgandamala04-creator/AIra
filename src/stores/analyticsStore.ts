import { create } from 'zustand';
import type {
    Achievement,
    SessionAnalytics,
    ProgressMetrics
} from '../types';
import { useAuthStore } from './authStore';
import { updateAnalyticsWithOfflineQueue as syncAnalyticsToBackend } from '../services/backendWithOffline';
import { realTimeEvents, EVENTS } from '../utils/realTimeSync';
import { ALL_SUBJECTS } from '../data/curriculumData';
import { toast } from './toastStore';

/** Compute current streak (consecutive days with at least one session) from session dates. */
function computeStreakFromSessions(sessions: SessionAnalytics[]): number {
    if (sessions.length === 0) return 0;
    const dates = Array.from(
        new Set(sessions.map(s => s.date?.split('T')[0]).filter(Boolean))
    ) as string[];
    if (dates.length === 0) return 0;
    dates.sort((a, b) => b.localeCompare(a)); // descending, most recent first
    let streak = 1;
    for (let i = 1; i < dates.length; i++) {
        const prev = new Date(dates[i - 1]);
        const curr = new Date(dates[i]);
        const diffDays = Math.round((prev.getTime() - curr.getTime()) / (24 * 60 * 60 * 1000));
        if (diffDays === 1) streak++;
        else break;
    }
    return streak;
}

interface AnalyticsStore {
    sessions: SessionAnalytics[];
    achievements: Achievement[];
    metrics: ProgressMetrics;

    // Actions
    addSession: (session: SessionAnalytics) => void;
    updateLatestSessionScore: (score: number) => void;
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
    },
    {
        id: 'subject_polymath',
        name: 'Subject Polymath',
        description: 'Study 5 different subjects',
        icon: '🎓',
        target: 5,
        progress: 0,
    },
    {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Complete a session before 8:00 AM',
        icon: '🌅',
        target: 1,
        progress: 0,
    },
    {
        id: 'scholar',
        name: 'Scholar',
        description: 'Reach Level 5',
        icon: '📜',
        target: 5,
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
        totalXp: 0,
        level: 1,
    },

    addSession: (session) => {
        const withDate = { ...session, date: session.date || new Date().toISOString().split('T')[0] };
        set((state) => ({
            sessions: [...state.sessions, withDate]
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

    updateLatestSessionScore: (score: number) => {
        const { sessions } = get();
        if (sessions.length === 0) return;

        const lastSession = { ...sessions[sessions.length - 1], quizScore: score };
        const updatedSessions = [...sessions.slice(0, -1), lastSession];

        set({ sessions: updatedSessions });
        get().updateMetrics();
        get().checkAchievements();

        const { user, isGuest } = useAuthStore.getState();
        if (user?.id && !isGuest) {
            syncAnalyticsToBackend(user.id, { sessions: updatedSessions, achievements: get().achievements, metrics: get().metrics })
                .catch((e: Error) => console.error('Backend sync analytics:', e));
        }
    },

    updateMetrics: () => {
        const { sessions } = get();
        const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
        const completedSessions = sessions.filter(s => s.completionPercentage === 100);
        const totalScore = sessions.reduce((acc, s) => acc + (s.quizScore || 0), 0);
        const streakDays = computeStreakFromSessions(sessions);

        // Calculate XP
        // 1 XP per second (60/min) + 100 XP per completion + 150 bonus for high scores
        let totalXp = totalMinutes * 60;
        totalXp += completedSessions.length * 100;
        sessions.forEach(s => {
            if ((s.quizScore ?? 0) >= 90) totalXp += 150;
        });

        // Level = floor(sqrt(xp/100)) + 1
        const level = Math.floor(Math.sqrt(totalXp / 100)) + 1;

        set((state) => ({
            metrics: {
                ...state.metrics,
                totalHours: Math.round((totalMinutes / 60) * 10) / 10,
                topicsCompleted: completedSessions.length,
                averageQuizScore: sessions.length ? Math.round(totalScore / sessions.length) : 0,
                streakDays,
                totalXp,
                level,
            }
        }));

        // Detect Level Up
        const { metrics: oldMetrics } = get();
        if (level > (oldMetrics.level || 1)) {
            realTimeEvents.emit(EVENTS.LEVEL_UP, { level, oldLevel: oldMetrics.level });
            toast.success(`Leveled up to Level ${level}! 🎉`);
        }
    },

    checkAchievements: () => {
        const { sessions, achievements, metrics } = get();
        const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);

        const alreadyUnlocked = (id: string) => achievements.some(a => a.id === id && a.unlockedAt);

        if (!alreadyUnlocked('first_step') && sessions.length >= 1) {
            get().unlockAchievement('first_step');
        }
        if (!alreadyUnlocked('quick_learner') && sessions.some(s => (s.quizScore ?? 0) >= 90)) {
            get().unlockAchievement('quick_learner');
        }
        if (!alreadyUnlocked('dedicated_student') && totalMinutes >= 300) {
            get().unlockAchievement('dedicated_student');
        }
        if (!alreadyUnlocked('streak_master') && metrics.streakDays >= 3) {
            get().unlockAchievement('streak_master');
        }

        // Subject Polymath
        if (!alreadyUnlocked('subject_polymath')) {
            const subjectNames = new Set<string>();
            sessions.forEach(s => {
                if (!s.topicId) return;
                // Match topic to subject name
                const subject = ALL_SUBJECTS.find(sub => sub.topics.some(t => t.id === s.topicId));
                if (subject) subjectNames.add(subject.name);
            });

            // Update progress even if not unlocked
            set(state => ({
                achievements: state.achievements.map(a =>
                    a.id === 'subject_polymath' ? { ...a, progress: Math.min(a.target || 0, subjectNames.size) } : a
                )
            }));

            if (subjectNames.size >= 5) {
                get().unlockAchievement('subject_polymath');
            }
        }

        // Early Bird
        if (!alreadyUnlocked('early_bird')) {
            const hasEarlySession = sessions.some(s => {
                if (!s.date) return false;
                const d = new Date(s.date);
                return d.getHours() < 8;
            });
            if (hasEarlySession) {
                get().unlockAchievement('early_bird');
            }
        }

        // Scholar (Level 5)
        if (!alreadyUnlocked('scholar')) {
            set(state => ({
                achievements: state.achievements.map(a =>
                    a.id === 'scholar' ? { ...a, progress: metrics.level } : a
                )
            }));
            if (metrics.level >= 5) {
                get().unlockAchievement('scholar');
            }
        }
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
            toast.success(`New Achievement: ${unlockedAchievement.name} ${unlockedAchievement.icon}`);
        }
        const { user, isGuest } = useAuthStore.getState();
        if (user?.id && !isGuest) {
            const s = get();
            syncAnalyticsToBackend(user.id, { sessions: s.sessions, achievements: s.achievements, metrics: s.metrics }).catch((e: Error) => console.error('Backend sync analytics:', e));
        }
    }
}));

// ==========================================
// Selectors / Getters for Mastery Logic
// ==========================================

export const getSubjectMastery = (sessions: SessionAnalytics[], subjectName: string): number => {
    // Find all subjects with this name (e.g. "Science" exists in Grade 6, 7, 8, 9, 10...)
    const matchingSubjects = ALL_SUBJECTS.filter(s => s.name.toLowerCase() === subjectName.toLowerCase() || s.id === subjectName.toLowerCase());

    // Collect all valid topic IDs for this subject name across all grades
    const validTopicIds = new Set(matchingSubjects.flatMap(s => s.topics.map(t => t.id)));

    if (validTopicIds.size === 0) return 0;

    // Filter sessions that belong to any of these topics
    const subjectSessions = sessions.filter(s => {
        return s.topicId && validTopicIds.has(s.topicId);
    });

    if (subjectSessions.length === 0) return 0;

    const quizSessions = subjectSessions.filter(s => s.quizScore != null);
    if (quizSessions.length === 0) return 10; // Base participation score

    const avgScore = quizSessions.reduce((sum, s) => sum + (s.quizScore || 0), 0) / quizSessions.length;

    // Weightings: 
    // Score: 70%
    // Volume (sessions count): 30% (capped at 20 sessions for max volume score)
    const volumeScore = Math.min(100, (subjectSessions.length / 20) * 100);

    return Math.round((avgScore * 0.7) + (volumeScore * 0.3));
};

export const getWeakTopics = (sessions: SessionAnalytics[]): { topicId: string, score: number }[] => {
    // Group by topic
    const topicScores: Record<string, { total: number, count: number }> = {};

    sessions.forEach(s => {
        if (!s.topicId || s.quizScore == null) return;
        if (!topicScores[s.topicId]) topicScores[s.topicId] = { total: 0, count: 0 };
        topicScores[s.topicId].total += s.quizScore;
        topicScores[s.topicId].count += 1;
    });

    const weakTopics: { topicId: string, score: number }[] = [];
    Object.entries(topicScores).forEach(([topicId, data]) => {
        const avg = data.total / data.count;
        if (avg < 70) {
            weakTopics.push({ topicId, score: Math.round(avg) });
        }
    });

    return weakTopics.sort((a, b) => a.score - b.score); // Lowest score first
};
