/**
 * User profile, settings, and analytics operations.
 */

import {
    db,
    hasFirebase,
} from '../lib/firebase';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    onSnapshot,
} from 'firebase/firestore';
import type {
    UserProfile,
    AppSettings,
    SessionAnalytics,
    Achievement,
    ProgressMetrics,
} from '../types';
import {
    DbUser,
    ProfileRow,
    rowToDbUser,
    profiles,
    userListeners,
    notifyUserListeners,
    defaultDbUser,
    defaultMetrics,
} from './backendServiceBase';

// ============================================================================
// User Data Operations
// ============================================================================

export async function getUser(uid: string): Promise<DbUser | null> {
    if (hasFirebase && db) {
        const snap = await getDoc(doc(db, 'profiles', uid));
        if (!snap.exists()) return null;
        return rowToDbUser({ id: uid, ...snap.data() } as ProfileRow);
    }
    return profiles.get(uid) ?? null;
}

export async function setUser(uid: string, data: Partial<DbUser>): Promise<void> {
    const now = new Date().toISOString();
    if (hasFirebase && db) {
        const row: ProfileRow = {
            id: uid,
            email: data.email ?? '',
            display_name: data.displayName ?? null,
            avatar_url: data.avatar ?? null,
            profile: data.profile ?? {},
            settings: data.settings ?? {},
            analytics: data.analytics ?? {
                sessions: [],
                achievements: [],
                metrics: defaultMetrics,
            },
            role: data.role ?? 'student',
            plan: data.plan ?? 'simple',
            onboarding_completed: data.onboardingCompleted ?? false,
            created_at: (data.createdAt as string) ?? now,
            updated_at: now,
        };
        await setDoc(doc(db, 'profiles', uid), row, { merge: true });
        return;
    }
    const existing = profiles.get(uid);
    const merged: DbUser = existing
        ? { ...existing, ...data, updatedAt: now }
        : { ...defaultDbUser(uid, now), ...data, updatedAt: now };
    profiles.set(uid, merged);
    notifyUserListeners(uid);
}

export function subscribeToUserData(
    uid: string,
    onData: (data: DbUser | null) => void,
    onError?: (error: Error) => void
): () => void {
    if (hasFirebase && db) {
        const unsub = onSnapshot(
            doc(db, 'profiles', uid),
            (snap) => {
                if (snap.exists()) {
                    onData(rowToDbUser({ id: uid, ...snap.data() } as ProfileRow));
                } else {
                    onData(null);
                }
            },
            (err) => onError?.(err)
        );
        return () => unsub();
    }
    if (!userListeners.has(uid)) userListeners.set(uid, new Set());
    userListeners.get(uid)!.add(onData);
    onData(profiles.get(uid) ?? null);
    return () => userListeners.get(uid)?.delete(onData);
}

// ============================================================================
// Profile / Settings / Analytics
// ============================================================================

export async function updateUserProfile(uid: string, profile: UserProfile): Promise<void> {
    if (hasFirebase && db) {
        await updateDoc(doc(db, 'profiles', uid), {
            profile,
            updated_at: new Date().toISOString(),
        });
        return;
    }
    const existing = profiles.get(uid);
    if (existing) {
        profiles.set(uid, { ...existing, profile, updatedAt: new Date().toISOString() });
        notifyUserListeners(uid);
    }
}

export async function updateUserSettings(uid: string, settings: Partial<AppSettings>): Promise<void> {
    if (hasFirebase && db) {
        await updateDoc(doc(db, 'profiles', uid), {
            settings,
            updated_at: new Date().toISOString(),
        });
        return;
    }
    const existing = profiles.get(uid);
    if (existing) {
        profiles.set(uid, {
            ...existing,
            settings: { ...existing.settings, ...settings },
            updatedAt: new Date().toISOString(),
        });
        notifyUserListeners(uid);
    }
}

export async function updateUserAnalytics(
    uid: string,
    analytics: { sessions: SessionAnalytics[]; achievements: Achievement[]; metrics: ProgressMetrics }
): Promise<void> {
    if (hasFirebase && db) {
        await updateDoc(doc(db, 'profiles', uid), {
            analytics,
            updated_at: new Date().toISOString(),
        });
        return;
    }
    const existing = profiles.get(uid);
    if (existing) {
        profiles.set(uid, { ...existing, analytics, updatedAt: new Date().toISOString() });
        notifyUserListeners(uid);
    }
}

export async function addSessionAnalytics(uid: string, session: SessionAnalytics): Promise<void> {
    const existingUser = await getUser(uid);
    if (!existingUser) return;

    const analytics = existingUser.analytics || { sessions: [], achievements: [], metrics: defaultMetrics };

    // IDEMPOTENCY: Check if this session was already recorded
    const isDuplicate = analytics.sessions.some(s => s.sessionId === session.sessionId);
    if (isDuplicate) return;

    const updatedSessions = [session, ...analytics.sessions].slice(0, 100);

    // Update metrics safely
    const metrics = { ...analytics.metrics };
    metrics.totalHours += session.durationMinutes / 60;
    metrics.topicsCompleted += 1;

    await updateUserAnalytics(uid, { ...analytics, sessions: updatedSessions, metrics });
}
