/**
 * Study asset operations: Doubts, Bookmarks, Notes, Flashcards, Mind Maps.
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
    deleteDoc,
    writeBatch,
} from 'firebase/firestore';
import type {
    Doubt,
    GeneratedNote,
    Flashcard,
    MindMap,
    StepBookmark,
} from '../types';
import {
    doubts,
    notes,
    flashcards,
    mindmaps,
    noteVersions,
    stepBookmarks,
    type NoteVersion,
} from './backendServiceBase';

// ============================================================================
// Doubts
// ============================================================================

export async function saveDoubt(uid: string, doubt: Doubt): Promise<string> {
    if (hasFirebase && db) {
        await setDoc(doc(db, 'doubts', doubt.id), {
            ...doubt,
            user_id: uid,
            created_at: new Date().toISOString(),
        });
        return doubt.id;
    }
    doubts.set(doubt.id, { ...doubt, userId: uid, createdAt: new Date().toISOString() });
    return doubt.id;
}

export async function updateDoubt(_uid: string, doubtId: string, updates: Partial<Doubt>): Promise<void> {
    if (hasFirebase && db) {
        await updateDoc(doc(db, 'doubts', doubtId), {
            ...updates,
            updated_at: new Date().toISOString(),
        });
        return;
    }
    const existing = doubts.get(doubtId);
    if (existing) {
        doubts.set(doubtId, { ...existing, ...updates });
    }
}

export async function getDoubts(uid: string, sessionId?: string, limitCount = 100): Promise<Doubt[]> {
    if (hasFirebase && db) {
        let q = query(collection(db, 'doubts'), where('user_id', '==', uid), limit(limitCount));
        if (sessionId) q = query(q, where('session_id', '==', sessionId));
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Doubt));
    }
    return Array.from(doubts.values())
        .filter((d) => d.userId === uid && (!sessionId || d.sessionId === sessionId))
        .slice(0, limitCount);
}

export function subscribeToDoubts(
    uid: string,
    onData: (list: Doubt[]) => void,
    sessionId?: string,
    onError?: (error: Error) => void
): () => void {
    if (hasFirebase && db) {
        let q = query(collection(db, 'doubts'), where('user_id', '==', uid), limit(100));
        if (sessionId) q = query(q, where('session_id', '==', sessionId));
        const unsub = onSnapshot(
            q,
            (snap) => {
                const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Doubt));
                onData(list);
            },
            (err) => onError?.(err as Error)
        );
        return () => unsub();
    }
    const emit = () => {
        const list = Array.from(doubts.values())
            .filter((d) => d.userId === uid && (!sessionId || d.sessionId === sessionId))
            .map((d) => ({ ...d } as Doubt));
        onData(list);
    };
    emit();
    return () => { };
}

// ============================================================================
// Step bookmarks
// ============================================================================

export async function addStepBookmark(uid: string, bookmark: Omit<StepBookmark, 'id' | 'createdAt'>): Promise<string> {
    const id = `bm_${Date.now()}`;
    const now = new Date().toISOString();
    if (hasFirebase && db) {
        await setDoc(doc(db, 'step_bookmarks', id), { ...bookmark, user_id: uid, created_at: now });
        return id;
    }
    stepBookmarks.set(id, { ...bookmark, id, createdAt: now, userId: uid });
    return id;
}

export async function removeStepBookmark(_uid: string, bookmarkId: string): Promise<void> {
    if (hasFirebase && db) {
        await deleteDoc(doc(db, 'step_bookmarks', bookmarkId));
        return;
    }
    stepBookmarks.delete(bookmarkId);
}

export function subscribeToStepBookmarks(
    uid: string,
    onData: (list: StepBookmark[]) => void,
    onError?: (error: Error) => void
): () => void {
    if (hasFirebase && db) {
        const q = query(collection(db, 'step_bookmarks'), where('user_id', '==', uid), orderBy('created_at', 'desc'), limit(100));
        const unsub = onSnapshot(
            q,
            (snap) => {
                const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as StepBookmark));
                onData(list);
            },
            (err) => onError?.(err as Error)
        );
        return () => unsub();
    }
    const emit = () => {
        const list = Array.from(stepBookmarks.values())
            .filter((b) => b.userId === uid)
            .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
            .map((b) => ({ ...b } as StepBookmark));
        onData(list);
    };
    emit();
    return () => { };
}

// ============================================================================
// Notes
// ============================================================================

export async function saveNote(uid: string, note: GeneratedNote): Promise<string> {
    if (hasFirebase && db) {
        await setDoc(doc(db, 'notes', note.id), {
            ...note,
            user_id: uid,
            created_at: new Date().toISOString(),
        });
        return note.id;
    }
    notes.set(note.id, { ...note, userId: uid, updatedAt: new Date().toISOString() });
    return note.id;
}

export async function updateNote(_uid: string, noteId: string, updates: Partial<GeneratedNote>): Promise<void> {
    if (hasFirebase && db) {
        await updateDoc(doc(db, 'notes', noteId), {
            ...updates,
            updated_at: new Date().toISOString(),
        });
        return;
    }
    const existing = notes.get(noteId);
    if (existing) {
        notes.set(noteId, { ...existing, ...updates, updatedAt: new Date().toISOString() });
    }
}

export async function getNotes(uid: string, limitCount = 50): Promise<GeneratedNote[]> {
    if (hasFirebase && db) {
        const q = query(collection(db, 'notes'), where('user_id', '==', uid), limit(limitCount));
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as GeneratedNote));
    }
    return Array.from(notes.values())
        .filter((n) => n.userId === uid)
        .slice(0, limitCount);
}

export async function getNoteVersions(_uid: string, noteId: string): Promise<NoteVersion[]> {
    if (hasFirebase && db) {
        const snap = await getDocs(query(collection(db, 'notes', noteId, 'versions'), orderBy('updated_at', 'desc'), limit(20)));
        return snap.docs.map(d => ({ ...d.data() } as NoteVersion));
    }
    return noteVersions.get(noteId) || [];
}

export function subscribeToNotes(
    uid: string,
    onData: (list: GeneratedNote[]) => void,
    onError?: (error: Error) => void
): () => void {
    if (hasFirebase && db) {
        const q = query(collection(db, 'notes'), where('user_id', '==', uid), orderBy('created_at', 'desc'), limit(50));
        const unsub = onSnapshot(
            q,
            (snap) => {
                const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as GeneratedNote));
                onData(list);
            },
            (err) => onError?.(err as Error)
        );
        return () => unsub();
    }
    const emit = () => {
        const list = Array.from(notes.values())
            .filter((n) => n.userId === uid)
            .map((n) => ({ ...n } as GeneratedNote));
        onData(list);
    };
    emit();
    return () => { };
}

export async function deleteNote(_uid: string, noteId: string): Promise<void> {
    if (hasFirebase && db) {
        await deleteDoc(doc(db, 'notes', noteId));
        return;
    }
    notes.delete(noteId);
}

// ============================================================================
// Flashcards
// ============================================================================

export async function saveFlashcards(uid: string, cards: Flashcard[]): Promise<void> {
    if (hasFirebase && db) {
        // Chunk flashcard saves into batches of 500
        for (let i = 0; i < cards.length; i += 500) {
            const batch = writeBatch(db);
            const chunk = cards.slice(i, i + 500);
            chunk.forEach((card) => {
                const ref = doc(collection(db, 'flashcards'), card.id);
                batch.set(ref, { ...card, user_id: uid, created_at: new Date().toISOString() });
            });
            await batch.commit();
        }
        return;
    }
    cards.forEach((c) => flashcards.set(c.id, { ...c, userId: uid, updatedAt: new Date().toISOString() }));
}

export async function getFlashcards(uid: string, sessionId?: string, limitCount = 200): Promise<Flashcard[]> {
    if (hasFirebase && db) {
        let q = query(collection(db, 'flashcards'), where('user_id', '==', uid), limit(limitCount));
        if (sessionId) q = query(q, where('session_id', '==', sessionId));
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Flashcard));
    }
    return Array.from(flashcards.values())
        .filter((c) => c.userId === uid && (!sessionId || c.sessionId === sessionId))
        .slice(0, limitCount);
}

export async function getDueFlashcards(uid: string): Promise<Flashcard[]> {
    if (hasFirebase && db) {
        const now = new Date().toISOString();
        const q = query(
            collection(db, 'flashcards'),
            where('user_id', '==', uid),
            where('next_review_date', '<=', now),
            limit(100)
        );
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Flashcard));
    }
    const now = new Date().toISOString();
    return Array.from(flashcards.values())
        .filter((c) => c.userId === uid && c.nextReviewDate <= now)
        .slice(0, 100);
}

export function subscribeToFlashcards(
    uid: string,
    onData: (cards: Flashcard[]) => void,
    sessionId?: string,
    onError?: (error: Error) => void
): () => void {
    if (hasFirebase && db) {
        let q = query(collection(db, 'flashcards'), where('user_id', '==', uid), limit(200));
        if (sessionId) q = query(q, where('session_id', '==', sessionId));
        const unsub = onSnapshot(
            q,
            (snap) => {
                const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Flashcard));
                onData(list);
            },
            (err) => onError?.(err as Error)
        );
        return () => unsub();
    }
    const emit = () => {
        const list = Array.from(flashcards.values())
            .filter((c) => c.userId === uid && (!sessionId || c.sessionId === sessionId))
            .map((c) => ({ ...c } as Flashcard));
        onData(list);
    };
    emit();
    return () => { };
}

export async function updateFlashcard(_uid: string, cardId: string, updates: Partial<Flashcard>): Promise<void> {
    if (hasFirebase && db) {
        await updateDoc(doc(db, 'flashcards', cardId), {
            ...updates,
            updated_at: new Date().toISOString(),
        });
        return;
    }
    const existing = flashcards.get(cardId);
    if (existing) {
        flashcards.set(cardId, { ...existing, ...updates, updatedAt: new Date().toISOString() });
    }
}

export async function deleteFlashcard(_uid: string, cardId: string): Promise<void> {
    if (hasFirebase && db) {
        await deleteDoc(doc(db, 'flashcards', cardId));
        return;
    }
    flashcards.delete(cardId);
}

// ============================================================================
// Mind Maps
// ============================================================================

export async function saveMindMap(uid: string, mindMap: MindMap): Promise<string> {
    if (hasFirebase && db) {
        await setDoc(doc(db, 'mind_maps', mindMap.id), {
            ...mindMap,
            user_id: uid,
            created_at: new Date().toISOString(),
        });
        return mindMap.id;
    }
    mindmaps.set(mindMap.id, { ...mindMap, userId: uid, updatedAt: new Date().toISOString() });
    return mindMap.id;
}

export async function getMindMaps(uid: string, limitCount = 50): Promise<MindMap[]> {
    if (hasFirebase && db) {
        const q = query(collection(db, 'mind_maps'), where('user_id', '==', uid), limit(limitCount));
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MindMap));
    }
    return Array.from(mindmaps.values())
        .filter((m) => m.userId === uid)
        .slice(0, limitCount);
}

export function subscribeToMindMaps(
    uid: string,
    onData: (maps: MindMap[]) => void,
    onError?: (error: Error) => void
): () => void {
    if (hasFirebase && db) {
        const q = query(collection(db, 'mind_maps'), where('user_id', '==', uid), orderBy('created_at', 'desc'), limit(50));
        const unsub = onSnapshot(
            q,
            (snap) => {
                const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as MindMap));
                onData(list);
            },
            (err) => onError?.(err as Error)
        );
        return () => unsub();
    }
    const emit = () => {
        const list = Array.from(mindmaps.values())
            .filter((m) => m.userId === uid)
            .map((m) => ({ ...m } as MindMap));
        onData(list);
    };
    emit();
    return () => { };
}

export async function deleteMindMap(_uid: string, mapId: string): Promise<void> {
    if (hasFirebase && db) {
        await deleteDoc(doc(db, 'mind_maps', mapId));
        return;
    }
    mindmaps.delete(mapId);
}
