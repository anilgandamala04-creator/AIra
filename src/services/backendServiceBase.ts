/**
 * Shared infrastructure for backend services:
 * - Firebase references (Firestore, Storage) or local fallback.
 * - In-memory maps for development without real backend.
 * - Common types and converters.
 */

import type {
    UserProfile,
    AppSettings,
    SessionAnalytics,
    Achievement,
    ProgressMetrics,
    TeachingSession,
    Doubt,
    GeneratedNote,
    MindMap,
    Flashcard,
    StepBookmark,
    NoteSection,
} from '../types';

// ============================================================================
// Types
// ============================================================================

export interface DbUser {
    id: string;
    email: string;
    displayName: string | null;
    avatar: string | null;
    profile: UserProfile | null;
    settings: Partial<AppSettings>;
    analytics: {
        sessions: SessionAnalytics[];
        achievements: Achievement[];
        metrics: ProgressMetrics;
    };
    role: 'student' | 'teacher' | 'admin';
    plan: 'simple' | 'pro' | 'enterprise';
    onboardingCompleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export const defaultMetrics: ProgressMetrics = {
    totalHours: 0,
    topicsCompleted: 0,
    averageQuizScore: 0,
    knowledgeRetention: 0,
    weeklyHours: [0, 0, 0, 0, 0, 0, 0],
    streakDays: 0,
    totalXp: 0,
    level: 1,
};

// ---- Row types (snake_case for Firestore) ----
export interface ProfileRow {
    id: string;
    email: string | null;
    display_name: string | null;
    avatar_url: string | null;
    profile: unknown;
    settings: unknown;
    analytics: unknown;
    role: string;
    plan: string;
    onboarding_completed: boolean;
    created_at: string;
    updated_at: string;
}

export function rowToDbUser(r: ProfileRow): DbUser {
    return {
        id: r.id,
        email: r.email ?? '',
        displayName: r.display_name,
        avatar: r.avatar_url,
        profile: (r.profile as UserProfile) ?? null,
        settings: (r.settings as Partial<AppSettings>) ?? {},
        analytics: (r.analytics as DbUser['analytics']) ?? {
            sessions: [],
            achievements: [],
            metrics: { ...defaultMetrics },
        },
        role: r.role as DbUser['role'],
        plan: r.plan as DbUser['plan'],
        onboardingCompleted: r.onboarding_completed,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
    };
}

// ============================================================================
// In-memory fallback state (shared across services)
// ============================================================================

export const profiles = new Map<string, DbUser>();
export const sessions = new Map<string, TeachingSession & { userId: string; createdAt?: string; updatedAt?: string }>();
export const doubts = new Map<string, Doubt & { userId: string; createdAt?: string }>();
export const notes = new Map<string, GeneratedNote & { userId: string; updatedAt?: string }>();
export interface NoteVersion {
    title: string;
    content: string;
    sections: NoteSection[];
    updatedAt: string;
}
export const noteVersions = new Map<string, NoteVersion[]>();
export const flashcards = new Map<string, Flashcard & { userId: string; updatedAt?: string }>();
export const mindmaps = new Map<string, MindMap & { userId: string; updatedAt?: string }>();
export const fileUrls = new Map<string, string>();
export const stepBookmarks = new Map<string, StepBookmark & { userId: string }>();

export type UserDataListener = (data: DbUser | null) => void;
export const userListeners = new Map<string, Set<UserDataListener>>();

export function notifyUserListeners(uid: string): void {
    const set = userListeners.get(uid);
    if (!set) return;
    const user = profiles.get(uid) ?? null;
    set.forEach((cb) => {
        try {
            cb(user);
        } catch (e) {
            console.error('backendService user listener error:', e);
        }
    });
}

export function defaultDbUser(uid: string, now: string): DbUser {
    return {
        id: uid,
        email: '',
        displayName: null,
        avatar: null,
        profile: null,
        settings: {},
        analytics: { sessions: [], achievements: [], metrics: { ...defaultMetrics } },
        role: 'student',
        plan: 'simple',
        onboardingCompleted: false,
        createdAt: now,
        updatedAt: now,
    };
}
