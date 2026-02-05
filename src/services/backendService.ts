/**
 * Firebase Backend Service
 *
 * Provides:
 * - Firestore for all application data (profiles, sessions, doubts, notes, flashcards, mindmaps)
 * - Firebase Storage for user-generated content
 * - Real-time subscriptions via onSnapshot
 *
 * Collections: profiles, sessions, doubts, notes, flashcards, mindmaps
 */

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
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

// ============================================================================
// Collection Names
// ============================================================================

const COLLECTIONS = {
  PROFILES: 'profiles',
  SESSIONS: 'sessions',
  DOUBTS: 'doubts',
  NOTES: 'notes',
  FLASHCARDS: 'flashcards',
  MINDMAPS: 'mindmaps',
} as const;

const STORAGE_BUCKET_PATH = 'user-content';

// ============================================================================
// Helpers
// ============================================================================

function toDb<T extends Record<string, unknown>>(data: T): T {
  return { ...data };
}

// ============================================================================
// User Data Operations
// ============================================================================

export async function getUser(uid: string): Promise<DbUser | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.PROFILES, uid));
  if (!snap.exists()) return null;
  const d = snap.data();
  return { id: snap.id, ...d } as DbUser;
}

const defaultDbUser = (uid: string, now: string): Record<string, unknown> => ({
  id: uid,
  email: '',
  displayName: null,
  avatar: null,
  profile: null,
  settings: {},
  analytics: { sessions: [], achievements: [], metrics: { totalHours: 0, topicsCompleted: 0, averageQuizScore: 0, knowledgeRetention: 0, weeklyHours: [0,0,0,0,0,0,0], streakDays: 0 } },
  role: 'student',
  plan: 'simple',
  onboardingCompleted: false,
  createdAt: now,
  updatedAt: now,
});

export async function setUser(uid: string, data: Partial<DbUser>): Promise<void> {
  const docRef = doc(db, COLLECTIONS.PROFILES, uid);
  const existing = await getDoc(docRef);
  const now = new Date().toISOString();
  if (existing.exists()) {
    await updateDoc(docRef, { ...data, updatedAt: now } as object);
  } else {
    await setDoc(docRef, { ...defaultDbUser(uid, now), ...data, updatedAt: now });
  }
}

export function subscribeToUserData(
  uid: string,
  onData: (data: DbUser | null) => void,
  _onError?: (error: Error) => void
): () => void {
  const ref = doc(db, COLLECTIONS.PROFILES, uid);
  const unsub: Unsubscribe = onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      onData({ id: snap.id, ...snap.data() } as DbUser);
    },
    (err) => {
      console.error('subscribeToUserData error:', err);
      _onError?.(err as Error);
    }
  );
  return unsub;
}

// ============================================================================
// Profile Operations
// ============================================================================

export async function updateUserProfile(uid: string, profile: UserProfile): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.PROFILES, uid), {
    profile,
    displayName: profile.displayName,
    avatar: profile.avatar ?? null,
    onboardingCompleted: profile.onboardingCompleted,
    updatedAt: new Date().toISOString(),
  });
}

// ============================================================================
// Settings Operations
// ============================================================================

export async function updateUserSettings(uid: string, settings: Partial<AppSettings>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.PROFILES, uid), {
    settings,
    updatedAt: new Date().toISOString(),
  });
}

// ============================================================================
// Analytics Operations
// ============================================================================

export async function updateUserAnalytics(
  uid: string,
  analytics: {
    sessions: SessionAnalytics[];
    achievements: Achievement[];
    metrics: ProgressMetrics;
  }
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.PROFILES, uid), {
    analytics,
    updatedAt: new Date().toISOString(),
  });
}

export async function addSessionAnalytics(uid: string, session: SessionAnalytics): Promise<void> {
  const user = await getUser(uid);
  if (!user) return;
  const sessions = [...(user.analytics?.sessions || []), session];
  const analytics = { ...user.analytics, sessions };
  await updateDoc(doc(db, COLLECTIONS.PROFILES, uid), {
    analytics,
    updatedAt: new Date().toISOString(),
  } as object);
}

// ============================================================================
// Teaching Session Operations
// ============================================================================

export async function createTeachingSession(
  uid: string,
  session: TeachingSession
): Promise<string> {
  const docRef = doc(db, COLLECTIONS.SESSIONS, session.id);
  const createdAt = (session as TeachingSession & { createdAt?: string }).createdAt ?? session.startTime ?? new Date().toISOString();
  await setDoc(docRef, toDb({ ...session, userId: uid, createdAt, updatedAt: new Date().toISOString() }));
  return session.id;
}

export async function updateTeachingSession(
  _uid: string,
  sessionId: string,
  updates: Partial<TeachingSession>
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.SESSIONS, sessionId);
  await updateDoc(docRef, { ...updates, updatedAt: new Date().toISOString() } as object);
}

export async function getTeachingSessions(
  uid: string,
  limitCount = 50
): Promise<TeachingSession[]> {
  const q = query(
    collection(db, COLLECTIONS.SESSIONS),
    where('userId', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as TeachingSession));
}

export function subscribeToTeachingSessions(
  uid: string,
  onData: (sessions: TeachingSession[]) => void,
  _onError?: (error: Error) => void
): () => void {
  const q = query(
    collection(db, COLLECTIONS.SESSIONS),
    where('userId', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  const unsub = onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() } as TeachingSession))),
    (err) => {
      console.error('subscribeToTeachingSessions error:', err);
      _onError?.(err as Error);
    }
  );
  return unsub;
}

// ============================================================================
// Doubt Operations
// ============================================================================

export async function saveDoubt(uid: string, doubt: Doubt): Promise<string> {
  const docRef = doc(db, COLLECTIONS.DOUBTS, doubt.id);
  const createdAt = (doubt as Doubt & { createdAt?: string }).createdAt ?? doubt.timestamp ?? new Date().toISOString();
  await setDoc(docRef, toDb({ ...doubt, userId: uid, createdAt }));
  return doubt.id;
}

export async function updateDoubt(
  _uid: string,
  doubtId: string,
  updates: Partial<Doubt>
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.DOUBTS, doubtId), updates as object);
}

export async function getDoubts(
  uid: string,
  sessionId?: string,
  limitCount = 100
): Promise<Doubt[]> {
  let q = query(
    collection(db, COLLECTIONS.DOUBTS),
    where('userId', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  if (sessionId) {
    q = query(
      collection(db, COLLECTIONS.DOUBTS),
      where('userId', '==', uid),
      where('sessionId', '==', sessionId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return { id: d.id, ...data, timestamp: data.timestamp ?? data.createdAt ?? '' } as Doubt;
  });
}

export function subscribeToDoubts(
  uid: string,
  onData: (doubts: Doubt[]) => void,
  sessionId?: string,
  onError?: (error: Error) => void
): () => void {
  const baseQuery = sessionId
    ? query(
        collection(db, COLLECTIONS.DOUBTS),
        where('userId', '==', uid),
        where('sessionId', '==', sessionId),
        orderBy('createdAt', 'desc'),
        limit(100)
      )
    : query(
        collection(db, COLLECTIONS.DOUBTS),
        where('userId', '==', uid),
        orderBy('createdAt', 'desc'),
        limit(100)
      );
  const unsub = onSnapshot(
    baseQuery,
    (snap) =>
      onData(
        snap.docs.map((d) => {
          const data = d.data();
          return { id: d.id, ...data, timestamp: data.timestamp ?? data.createdAt ?? '' } as Doubt;
        })
      ),
    (err) => {
      console.error('subscribeToDoubts error:', err);
      onError?.(err as Error);
    }
  );
  return unsub;
}

// ============================================================================
// Notes Operations
// ============================================================================

export async function saveNote(uid: string, note: GeneratedNote): Promise<string> {
  const docRef = doc(db, COLLECTIONS.NOTES, note.id);
  const now = new Date().toISOString();
  const createdAt = note.createdAt ?? now;
  await setDoc(docRef, toDb({ ...note, userId: uid, createdAt, updatedAt: now }));
  return note.id;
}

export async function updateNote(
  _uid: string,
  noteId: string,
  updates: Partial<GeneratedNote>
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.NOTES, noteId), {
    ...updates,
    updatedAt: new Date().toISOString(),
  } as object);
}

export async function deleteNote(_uid: string, noteId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.NOTES, noteId));
}

export async function getNotes(uid: string, limitCount = 50): Promise<GeneratedNote[]> {
  const q = query(
    collection(db, COLLECTIONS.NOTES),
    where('userId', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as GeneratedNote));
}

export function subscribeToNotes(
  uid: string,
  onData: (notes: GeneratedNote[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(
    collection(db, COLLECTIONS.NOTES),
    where('userId', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() } as GeneratedNote))),
    (err) => {
      console.error('subscribeToNotes error:', err);
      onError?.(err as Error);
    }
  );
}

// ============================================================================
// Flashcard Operations (use nextReviewDate to match type)
// ============================================================================

export async function saveFlashcards(uid: string, flashcards: Flashcard[]): Promise<void> {
  const batch = writeBatch(db);
  const now = new Date().toISOString();
  for (const card of flashcards) {
    const docRef = doc(db, COLLECTIONS.FLASHCARDS, card.id);
    batch.set(docRef, toDb({ ...card, userId: uid, updatedAt: now }));
  }
  await batch.commit();
}

export async function updateFlashcard(
  _uid: string,
  cardId: string,
  updates: Partial<Flashcard>
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.FLASHCARDS, cardId), {
    ...updates,
    updatedAt: new Date().toISOString(),
  } as object);
}

export async function deleteFlashcard(_uid: string, cardId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.FLASHCARDS, cardId));
}

export async function getFlashcards(
  uid: string,
  sessionId?: string,
  limitCount = 200
): Promise<Flashcard[]> {
  let q = query(
    collection(db, COLLECTIONS.FLASHCARDS),
    where('userId', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  if (sessionId) {
    q = query(
      collection(db, COLLECTIONS.FLASHCARDS),
      where('userId', '==', uid),
      where('sessionId', '==', sessionId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Flashcard));
}

export async function getDueFlashcards(uid: string): Promise<Flashcard[]> {
  const now = new Date().toISOString();
  const q = query(
    collection(db, COLLECTIONS.FLASHCARDS),
    where('userId', '==', uid),
    where('nextReviewDate', '<=', now),
    orderBy('nextReviewDate', 'asc'),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Flashcard));
}

export function subscribeToFlashcards(
  uid: string,
  onData: (cards: Flashcard[]) => void,
  sessionId?: string,
  onError?: (error: Error) => void
): () => void {
  const baseQuery = sessionId
    ? query(
        collection(db, COLLECTIONS.FLASHCARDS),
        where('userId', '==', uid),
        where('sessionId', '==', sessionId),
        orderBy('createdAt', 'desc'),
        limit(200)
      )
    : query(
        collection(db, COLLECTIONS.FLASHCARDS),
        where('userId', '==', uid),
        orderBy('createdAt', 'desc'),
        limit(200)
      );
  return onSnapshot(
    baseQuery,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Flashcard))),
    (err) => {
      console.error('subscribeToFlashcards error:', err);
      onError?.(err as Error);
    }
  );
}

// ============================================================================
// Mind Map Operations
// ============================================================================

export async function saveMindMap(uid: string, mindMap: MindMap): Promise<string> {
  const docRef = doc(db, COLLECTIONS.MINDMAPS, mindMap.id);
  await setDoc(docRef, toDb({ ...mindMap, userId: uid, updatedAt: new Date().toISOString() }));
  return mindMap.id;
}

export async function updateMindMap(
  _uid: string,
  mapId: string,
  updates: Partial<MindMap>
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.MINDMAPS, mapId), {
    ...updates,
    updatedAt: new Date().toISOString(),
  } as object);
}

export async function deleteMindMap(_uid: string, mapId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.MINDMAPS, mapId));
}

export async function getMindMaps(uid: string, limitCount = 50): Promise<MindMap[]> {
  const q = query(
    collection(db, COLLECTIONS.MINDMAPS),
    where('userId', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MindMap));
}

export function subscribeToMindMaps(
  uid: string,
  onData: (maps: MindMap[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(
    collection(db, COLLECTIONS.MINDMAPS),
    where('userId', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() } as MindMap))),
    (err) => {
      console.error('subscribeToMindMaps error:', err);
      onError?.(err as Error);
    }
  );
}

// ============================================================================
// File Storage Operations (Firebase Storage)
// ============================================================================

export async function uploadFile(
  uid: string,
  path: string,
  file: File | Blob
): Promise<string> {
  const storageRef = ref(storage, `${STORAGE_BUCKET_PATH}/${uid}/${path}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function getFileUrl(uid: string, path: string): Promise<string> {
  const storageRef = ref(storage, `${STORAGE_BUCKET_PATH}/${uid}/${path}`);
  return getDownloadURL(storageRef);
}

export async function deleteFile(uid: string, path: string): Promise<void> {
  const storageRef = ref(storage, `${STORAGE_BUCKET_PATH}/${uid}/${path}`);
  await deleteObject(storageRef);
}

// ============================================================================
// Batch Operations
// ============================================================================

export async function deleteAllUserData(uid: string): Promise<void> {
  const batch = writeBatch(db);

  const profilesRef = doc(db, COLLECTIONS.PROFILES, uid);
  batch.delete(profilesRef);

  const sessionsSnap = await getDocs(
    query(collection(db, COLLECTIONS.SESSIONS), where('userId', '==', uid))
  );
  sessionsSnap.docs.forEach((d) => batch.delete(d.ref));

  const doubtsSnap = await getDocs(
    query(collection(db, COLLECTIONS.DOUBTS), where('userId', '==', uid))
  );
  doubtsSnap.docs.forEach((d) => batch.delete(d.ref));

  const notesSnap = await getDocs(
    query(collection(db, COLLECTIONS.NOTES), where('userId', '==', uid))
  );
  notesSnap.docs.forEach((d) => batch.delete(d.ref));

  const flashcardsSnap = await getDocs(
    query(collection(db, COLLECTIONS.FLASHCARDS), where('userId', '==', uid))
  );
  flashcardsSnap.docs.forEach((d) => batch.delete(d.ref));

  const mindmapsSnap = await getDocs(
    query(collection(db, COLLECTIONS.MINDMAPS), where('userId', '==', uid))
  );
  mindmapsSnap.docs.forEach((d) => batch.delete(d.ref));

  await batch.commit();

  try {
    const listRef = ref(storage, `${STORAGE_BUCKET_PATH}/${uid}`);
    const listResult = await listAll(listRef);
    for (const item of listResult.items) {
      await deleteObject(item);
    }
    for (const prefix of listResult.prefixes) {
      const nested = await listAll(prefix);
      for (const item of nested.items) {
        await deleteObject(item);
      }
    }
  } catch (err) {
    console.error('Error cleaning up storage:', err);
  }
}
