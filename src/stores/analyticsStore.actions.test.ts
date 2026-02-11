import { describe, it, expect, beforeEach } from 'vitest';
import { useAnalyticsStore } from './analyticsStore';
import type { SessionAnalytics } from '../types';

describe('Analytics Store Actions', () => {
    beforeEach(() => {
        // Reset the store state before each test
        useAnalyticsStore.setState({
            sessions: [],
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
            achievements: [
                { id: 'first_step', name: 'First Step', description: '', icon: '', progress: 0, target: 1 },
                { id: 'quick_learner', name: 'Quick Learner', description: '', icon: '', progress: 0, target: 1 },
                { id: 'dedicated_student', name: 'Dedicated Student', description: '', icon: '', progress: 0, target: 300 },
                { id: 'streak_master', name: 'Streak Master', description: '', icon: '', progress: 0, target: 3 },
                { id: 'subject_polymath', name: 'Subject Polymath', description: '', icon: '', progress: 0, target: 5 },
                { id: 'early_bird', name: 'Early Bird', description: '', icon: '', progress: 0, target: 1 },
                { id: 'scholar', name: 'Scholar', description: '', icon: '', progress: 0, target: 5 }
            ]
        });
    });

    it('addSession should record a session and update metrics including XP', () => {
        const session: SessionAnalytics = {
            sessionId: 'test-session-1',
            topicId: 'motion',
            date: new Date().toISOString(),
            durationMinutes: 60,
            completionPercentage: 100,
            doubtsCount: 0
        };

        useAnalyticsStore.getState().addSession(session);

        const state = useAnalyticsStore.getState();
        expect(state.sessions.length).toBe(1);
        expect(state.sessions[0].sessionId).toBe('test-session-1');
        expect(state.metrics.totalHours).toBe(1);
        expect(state.metrics.topicsCompleted).toBe(1);
        // 60 mins * 60 = 3600 XP + 100 completion = 3700 XP
        expect(state.metrics.totalXp).toBe(3700);
        // sqrt(3700/100) + 1 = sqrt(37) + 1 = 6.08 + 1 = 7
        expect(state.metrics.level).toBe(7);
    });

    it('updateLatestSessionScore should update the quizScore and XP', () => {
        const session: SessionAnalytics = {
            sessionId: 'test-session-1',
            topicId: 'motion',
            date: new Date().toISOString(),
            durationMinutes: 60,
            completionPercentage: 100,
            doubtsCount: 0
        };

        useAnalyticsStore.getState().addSession(session);
        const xpBefore = useAnalyticsStore.getState().metrics.totalXp;

        useAnalyticsStore.getState().updateLatestSessionScore(95);

        const state = useAnalyticsStore.getState();
        expect(state.sessions[0].quizScore).toBe(95);
        expect(state.metrics.averageQuizScore).toBe(95);
        // Bonus 150 XP for score >= 90
        expect(state.metrics.totalXp).toBe(xpBefore + 150);
    });

    it('updateLatestSessionScore should trigger achievement checks including level milestones', () => {
        const session: SessionAnalytics = {
            sessionId: 'test-session-1',
            topicId: 'motion',
            date: new Date().toISOString(),
            durationMinutes: 10, // 600 XP
            completionPercentage: 100, // +100 = 700 XP
            doubtsCount: 0
        };

        useAnalyticsStore.getState().addSession(session);

        // At level 3 (sqrt(7) + 1 = 2.6 + 1 = 3)
        expect(useAnalyticsStore.getState().metrics.level).toBe(3);
        expect(useAnalyticsStore.getState().achievements.find(a => a.id === 'scholar')?.unlockedAt).toBeUndefined();

        // Increase XP to reach level 5
        // level 5 needs 1600+ XP (sqrt(16) + 1 = 5)
        const longSession: SessionAnalytics = {
            sessionId: 'test-session-2',
            topicId: 'motion',
            date: new Date().toISOString(),
            durationMinutes: 20, // 1200 XP
            completionPercentage: 100, // +100 = 1300 XP
            doubtsCount: 0
        };
        // Total XP = 700 + 1300 = 2000
        // Level = sqrt(20) + 1 = 4.4 + 1 = 5

        useAnalyticsStore.getState().addSession(longSession);

        const state = useAnalyticsStore.getState();
        expect(state.metrics.level).toBe(5);
        const achievement = state.achievements.find(a => a.id === 'scholar');
        expect(achievement?.unlockedAt).toBeDefined();
    });
});
