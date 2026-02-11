import { describe, it, expect } from 'vitest';
import { getSubjectMastery, getWeakTopics } from './analyticsStore';
import type { SessionAnalytics } from '../types';

// Mock generic sessions using real topic IDs from secondary curriculum
const mockSessions: SessionAnalytics[] = [
    {
        sessionId: '1',
        topicId: 'motion', // Science (Grade 9)
        date: '2024-01-01',
        durationMinutes: 30,
        quizScore: 90,
        completionPercentage: 100,
        doubtsCount: 0
    },
    {
        sessionId: '2',
        topicId: 'motion',
        date: '2024-01-02',
        durationMinutes: 30,
        quizScore: 100,
        completionPercentage: 100,
        doubtsCount: 0
    },
    {
        sessionId: '3',
        topicId: 'polynomials', // Mathematics (Grade 9)
        date: '2024-01-03',
        durationMinutes: 45,
        quizScore: 40,
        completionPercentage: 100,
        doubtsCount: 2
    },
    {
        sessionId: '4',
        topicId: 'polynomials',
        date: '2024-01-04',
        durationMinutes: 20,
        quizScore: 50, // Avg 45
        completionPercentage: 100,
        doubtsCount: 1
    }
];

describe('Analytics Logic', () => {
    describe('getSubjectMastery', () => {
        it('calculates mastery correctly for a high-performing subject', () => {
            // Science: Avg Score = 95. Volume = 2 sessions (10% of max 20).
            // Mastery = round(95 * 0.7 + 10 * 0.3) = round(66.5 + 3) = 70.

            const mastery = getSubjectMastery(mockSessions, 'Science');
            expect(mastery).toBe(70);
        });

        it('returns 0 if no sessions for subject', () => {
            const mastery = getSubjectMastery(mockSessions, 'Social Science');
            expect(mastery).toBe(0);
        });

        it('calculates mastery correctly for low performing subject', () => {
            // Mathematics: Avg Score = 45. Volume = 2 sessions (10%).
            // Mastery = round(45 * 0.7 + 10 * 0.3) = round(31.5 + 3) = 35.
            const mastery = getSubjectMastery(mockSessions, 'Mathematics');
            expect(mastery).toBe(35);
        });
    });


    describe('getWeakTopics', () => {
        it('identifies topics with average score < 70', () => {
            const weak = getWeakTopics(mockSessions);
            // Mathematics (polynomials) avg is 45 (<70). Science (motion) is 95 (>70).
            expect(weak.length).toBe(1);
            expect(weak[0].topicId).toBe('polynomials');
            expect(weak[0].score).toBe(45);
        });

        it('sorts weak topics by score ascending', () => {
            const extraSessions = [
                ...mockSessions,
                {
                    sessionId: '5',
                    topicId: 'real-numbers', // Math Grade 10
                    date: '2024-01-05',
                    durationMinutes: 10,
                    quizScore: 20,
                    completionPercentage: 100,
                    doubtsCount: 0
                }
            ];

            const weak = getWeakTopics(extraSessions);
            // real-numbers: 20, polynomials: 45
            expect(weak[0].topicId).toBe('real-numbers');
            expect(weak[1].topicId).toBe('polynomials');
        });
    });
});
