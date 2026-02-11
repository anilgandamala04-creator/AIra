/**
 * Teaching session operations.
 */

import {
    db,
    hasFirebase,
} from '../lib/firebase';
import {
    doc,
    setDoc,
    updateDoc,
    collection,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    getDocs,
} from 'firebase/firestore';
import type { TeachingSession } from '../types';
import {
    sessions,
} from './backendServiceBase';

// ============================================================================
// Teaching Sessions
// ============================================================================

export async function createTeachingSession(uid: string, session: TeachingSession): Promise<string> {
    if (hasFirebase && db) {
        const sessionWithUser = {
            ...session,
            user_id: uid,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        // Rename keys to match Row types used in exportAllUserData
        const row = {
            ...sessionWithUser,
            topic_id: session.topicId,
            topic_name: session.topicName,
            start_time: session.startTime,
            end_time: session.endTime,
            current_step: session.currentStep,
            total_steps: session.totalSteps,
            teaching_steps: session.teachingSteps,
            curriculum_type: session.curriculumType,
            subject_id: session.subjectId,
            subject_name: session.subjectName,
            visual_type: session.visualType,
            visual_prompt: session.visualPrompt,
        };
        await setDoc(doc(db, 'teaching_sessions', session.id), row);
        return session.id;
    }
    sessions.set(session.id, { ...session, userId: uid, createdAt: new Date().toISOString() });
    return session.id;
}

export async function updateTeachingSession(
    _uid: string,
    sessionId: string,
    updates: Partial<TeachingSession>
): Promise<void> {
    const finalUpdates: Record<string, unknown> = { ...updates, updated_at: new Date().toISOString() };
    if (updates.currentStep !== undefined) finalUpdates.current_step = updates.currentStep;
    if (updates.progress !== undefined) finalUpdates.progress = updates.progress;
    if (updates.teachingSteps !== undefined) finalUpdates.teaching_steps = updates.teachingSteps;

    if (hasFirebase && db) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await updateDoc(doc(db, 'teaching_sessions', sessionId), finalUpdates as any);
        return;
    }
    const existing = sessions.get(sessionId);
    if (existing) {
        sessions.set(sessionId, { ...existing, ...updates, updatedAt: new Date().toISOString() });
    }
}

export async function getTeachingSessionsFirebase(uid: string, limitCount: number): Promise<TeachingSession[]> {
    if (!hasFirebase || !db) return [];
    const q = query(
        collection(db, 'teaching_sessions'),
        where('user_id', '==', uid),
        orderBy('created_at', 'desc'),
        limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
        const r = d.data();
        return {
            id: d.id,
            userId: r.user_id,
            topicId: r.topic_id,
            topicName: r.topic_name,
            startTime: r.start_time,
            endTime: r.end_time,
            status: r.status,
            currentStep: r.current_step,
            totalSteps: r.total_steps,
            progress: r.progress,
            teachingSteps: r.teaching_steps,
            doubts: [],
            curriculumType: r.curriculum_type,
            board: r.board,
            grade: r.grade,
            exam: r.exam,
            subjectId: r.subject_id,
            subjectName: r.subject_name,
            visualType: r.visual_type,
            visualPrompt: r.visual_prompt,
        } as TeachingSession;
    });
}

export async function getTeachingSessions(uid: string, limitCount = 50): Promise<TeachingSession[]> {
    if (hasFirebase && db) {
        return getTeachingSessionsFirebase(uid, limitCount);
    }
    return Array.from(sessions.values())
        .filter((s) => s.userId === uid)
        .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
        .slice(0, limitCount)
        .map((s) => ({ ...s, userId: s.userId } as TeachingSession));
}

function rowToTeachingSession(d: { id: string } & Record<string, unknown>): TeachingSession {
    const r = d;
    return {
        id: r.id,
        userId: r.user_id,
        topicId: r.topic_id,
        topicName: r.topic_name,
        startTime: r.start_time,
        endTime: r.end_time,
        status: r.status,
        currentStep: r.current_step,
        totalSteps: r.total_steps,
        progress: r.progress,
        teachingSteps: r.teaching_steps,
        doubts: [],
        curriculumType: r.curriculum_type,
        board: r.board,
        grade: r.grade,
        exam: r.exam,
        subjectId: r.subject_id,
        subjectName: r.subject_name,
        visualType: r.visual_type,
        visualPrompt: r.visual_prompt,
    } as TeachingSession;
}

export function subscribeToTeachingSessions(
    uid: string,
    onData: (sessionsList: TeachingSession[]) => void,
    onError?: (error: Error) => void
): () => void {
    if (hasFirebase && db) {
        const q = query(
            collection(db, 'teaching_sessions'),
            where('user_id', '==', uid),
            orderBy('created_at', 'desc'),
            limit(50)
        );
        const unsub = onSnapshot(
            q,
            (snap) => {
                const list = snap.docs.map((d) => rowToTeachingSession({ id: d.id, ...d.data() }));
                onData(list);
            },
            (err) => onError?.(err)
        );
        return () => unsub();
    }
    const emit = () => {
        const list = Array.from(sessions.values())
            .filter((s) => s.userId === uid)
            .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
            .map((s) => ({ ...s } as TeachingSession));
        onData(list);
    };
    emit();
    // Simplified: no global listener for all sessions, but could add one if needed
    return () => { };
}
