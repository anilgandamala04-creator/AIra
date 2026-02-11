/**
 * High-level data orchestration: export and delete all user data.
 */

import {
    db,
    hasFirebase,
} from '../lib/firebase';
import {
    doc,
    getDoc,
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    writeBatch,
} from 'firebase/firestore';
import type {
    TeachingSession,
    Doubt,
    GeneratedNote,
    Flashcard,
    MindMap,
} from '../types';
import {
    DbUser,
    ProfileRow,
    rowToDbUser,
    profiles,
    sessions,
    doubts,
    notes,
    flashcards,
    mindmaps,
} from './backendServiceBase';

export interface ExportedUserData {
    exportedAt: string;
    uid: string;
    profile: DbUser | null;
    teachingSessions: TeachingSession[];
    doubts: Doubt[];
    notes: GeneratedNote[];
    flashcards: Flashcard[];
    mindMaps: MindMap[];
}

export async function exportAllUserData(uid: string): Promise<ExportedUserData> {
    const now = new Date().toISOString();
    if (hasFirebase && db) {
        const [profileSnap, sessionsSnap, doubtsSnap, notesSnap, flashcardsSnap, mapsSnap] = await Promise.all([
            getDoc(doc(db, 'profiles', uid)),
            getDocs(query(collection(db, 'teaching_sessions'), where('user_id', '==', uid), orderBy('created_at', 'desc'), limit(1000))),
            getDocs(query(collection(db, 'doubts'), where('user_id', '==', uid), limit(1000))),
            getDocs(query(collection(db, 'notes'), where('user_id', '==', uid), limit(1000))),
            getDocs(query(collection(db, 'flashcards'), where('user_id', '==', uid), limit(1000))),
            getDocs(query(collection(db, 'mind_maps'), where('user_id', '==', uid), limit(500))),
        ]);
        const profile = profileSnap.exists() ? rowToDbUser(profileSnap.data() as ProfileRow) : null;
        const teachingSessions = sessionsSnap.docs.map((d) => {
            const r = d.data();
            return {
                id: r.id ?? d.id,
                userId: r.user_id,
                topicId: r.topic_id,
                topicName: r.topic_name,
                startTime: r.start_time,
                endTime: r.end_time,
                status: r.status ?? 'active',
                currentStep: r.current_step ?? 0,
                totalSteps: r.total_steps ?? 0,
                progress: r.progress ?? 0,
                teachingSteps: r.teaching_steps ?? [],
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
        const doubts = doubtsSnap.docs.map((d) => {
            const r = d.data();
            return { id: r.id ?? d.id, sessionId: r.session_id, question: r.question, status: r.status, resolution: r.resolution, timestamp: r.timestamp ?? r.created_at ?? '', context: r.context ?? {} } as Doubt;
        });
        const notes = notesSnap.docs.map((d) => {
            const r = d.data();
            return { id: r.id ?? d.id, sessionId: r.session_id, topicName: r.topic_name, title: r.title, content: r.content ?? '', sections: r.sections ?? [], userDoubts: r.user_doubts ?? [], createdAt: r.created_at, qualityScore: r.quality_score } as GeneratedNote;
        });
        const flashcards = flashcardsSnap.docs.map((d) => {
            const r = d.data();
            return { id: r.id ?? d.id, sessionId: r.session_id, question: r.question, answer: r.answer, explanation: r.explanation, hint: r.hint, difficulty: r.difficulty, tags: r.tags ?? [], deckId: r.deck_id, deckName: r.deck_name, nextReviewDate: r.next_review_date, intervalDays: r.interval_days ?? 1, easeFactor: r.ease_factor ?? 2.5, repetitions: r.repetitions ?? 0, lastPerformance: r.last_performance } as Flashcard;
        });
        const mindMaps = mapsSnap.docs.map((d) => {
            const r = d.data();
            return { id: r.id ?? d.id, sessionId: r.session_id, topicName: r.topic_name, centralTopic: r.central_topic, nodes: r.nodes ?? [], createdAt: r.created_at } as MindMap;
        });
        return { exportedAt: now, uid, profile, teachingSessions, doubts, notes, flashcards, mindMaps };
    }
    const profile = profiles.get(uid) ?? null;
    const teachingSessions = Array.from(sessions.values()).filter((s) => s.userId === uid).map((s) => ({ ...s, id: s.id } as TeachingSession));
    const doubtsList = Array.from(doubts.values()).filter((d) => d.userId === uid).map((d) => ({ ...d, id: d.id } as Doubt));
    const notesList = Array.from(notes.values()).filter((n) => n.userId === uid).map((n) => ({ ...n, id: n.id } as GeneratedNote));
    const flashcardsList = Array.from(flashcards.values()).filter((c) => c.userId === uid).map((c) => ({ ...c, id: c.id } as Flashcard));
    const mindMapsList = Array.from(mindmaps.values()).filter((m) => m.userId === uid).map((m) => ({ ...m, id: m.id } as MindMap));
    return { exportedAt: now, uid, profile, teachingSessions: teachingSessions.slice(0, 1000), doubts: doubtsList.slice(0, 1000), notes: notesList.slice(0, 1000), flashcards: flashcardsList.slice(0, 1000), mindMaps: mindMapsList.slice(0, 500) };
}

export async function deleteAllUserData(uid: string): Promise<void> {
    if (hasFirebase && db) {
        const collections = ['teaching_sessions', 'doubts', 'notes', 'flashcards', 'mind_maps', 'step_bookmarks'];
        for (const col of collections) {
            const q = query(collection(db, col), where('user_id', '==', uid));
            const snap = await getDocs(q);

            // Chunk deletions into batches of 500
            const docs = snap.docs;
            for (let i = 0; i < docs.length; i += 500) {
                const batch = writeBatch(db);
                const chunk = docs.slice(i, i + 500);
                chunk.forEach((d) => batch.delete(d.ref));
                await batch.commit();
            }
        }
        const profileRef = doc(db, 'profiles', uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
            const batch = writeBatch(db);
            batch.delete(profileRef);
            await batch.commit();
        }
        return;
    }
    profiles.delete(uid);
    Array.from(sessions.entries()).forEach(([id, s]) => { if (s.userId === uid) sessions.delete(id); });
    Array.from(doubts.entries()).forEach(([id, d]) => { if (d.userId === uid) doubts.delete(id); });
    Array.from(notes.entries()).forEach(([id, n]) => { if (n.userId === uid) notes.delete(id); });
    Array.from(flashcards.entries()).forEach(([id, c]) => { if (c.userId === uid) flashcards.delete(id); });
    Array.from(mindmaps.entries()).forEach(([id, m]) => { if (m.userId === uid) mindmaps.delete(id); });
}
