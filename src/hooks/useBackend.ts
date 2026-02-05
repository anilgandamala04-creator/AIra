/**
 * Backend Hooks
 * 
 * React hooks for real-time data synchronization.
 * These hooks automatically subscribe to database collections
 * and keep local state in sync with the database.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import {
  subscribeToUserData,
  subscribeToTeachingSessions,
  subscribeToDoubts,
  subscribeToNotes,
  subscribeToFlashcards,
  subscribeToMindMaps,
  saveNote,
  saveFlashcards,
  saveMindMap,
  saveDoubt,
  updateDoubt,
  createTeachingSession,
  updateTeachingSession,
  updateFlashcard,
  deleteNote,
  deleteFlashcard,
  deleteMindMap,
  type DbUser,
} from '../services/backendService';
import type {
  TeachingSession,
  Doubt,
  GeneratedNote,
  Flashcard,
  MindMap,
} from '../types';

// ============================================================================
// User Data Hook
// ============================================================================

interface UseAuthUserResult {
  userData: DbUser | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to subscribe to the current user's database data in real-time.
 * Automatically subscribes when user is authenticated and unsubscribes on logout.
 */
export function useAuthUser(): UseAuthUserResult {
  const [userData, setUserData] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const user = useAuthStore((s) => s.user);
  const isGuest = useAuthStore((s) => s.isGuest);
  const uid = user?.id;

  useEffect(() => {
    if (!uid || isGuest) {
      setUserData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToUserData(
      uid,
      (data) => {
        setUserData(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [uid, isGuest]);

  return { userData, loading, error };
}

// ============================================================================
// Teaching Sessions Hook
// ============================================================================

interface UseTeachingSessionsResult {
  sessions: TeachingSession[];
  loading: boolean;
  error: Error | null;
  createSession: (session: TeachingSession) => Promise<string>;
  updateSession: (sessionId: string, updates: Partial<TeachingSession>) => Promise<void>;
}

/**
 * Hook to manage teaching sessions with real-time sync.
 */
export function useTeachingSessions(): UseTeachingSessionsResult {
  const [sessions, setSessions] = useState<TeachingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<Error | null>(null);

  const user = useAuthStore((s) => s.user);
  const isGuest = useAuthStore((s) => s.isGuest);
  const uid = user?.id;

  useEffect(() => {
    if (!uid || isGuest) {
      setSessions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToTeachingSessions(
      uid,
      (data) => {
        setSessions(data);
        setLoading(false);
      },
      (err) => {
        console.error('Teaching sessions subscription error:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [uid, isGuest]);

  const createSession = useCallback(
    async (session: TeachingSession): Promise<string> => {
      if (!uid || isGuest) throw new Error('Must be logged in');
      return createTeachingSession(uid, session);
    },
    [uid, isGuest]
  );

  const updateSession = useCallback(
    async (sessionId: string, updates: Partial<TeachingSession>): Promise<void> => {
      if (!uid || isGuest) return;
      await updateTeachingSession(uid, sessionId, updates);
    },
    [uid, isGuest]
  );

  return { sessions, loading, error, createSession, updateSession };
}

// ============================================================================
// Doubts Hook
// ============================================================================

interface UseDoubtsResult {
  doubts: Doubt[];
  loading: boolean;
  error: Error | null;
  addDoubt: (doubt: Doubt) => Promise<string>;
  resolveDoubt: (doubtId: string, updates: Partial<Doubt>) => Promise<void>;
}

/**
 * Hook to manage doubts with real-time sync.
 */
export function useDoubts(sessionId?: string): UseDoubtsResult {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<Error | null>(null);

  const user = useAuthStore((s) => s.user);
  const isGuest = useAuthStore((s) => s.isGuest);
  const uid = user?.id;

  useEffect(() => {
    if (!uid || isGuest) {
      setDoubts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToDoubts(uid, (data) => {
      setDoubts(data);
      setLoading(false);
    }, sessionId);

    return () => unsubscribe();
  }, [uid, isGuest, sessionId]);

  const addDoubt = useCallback(
    async (doubt: Doubt): Promise<string> => {
      if (!uid || isGuest) throw new Error('Must be logged in');
      return saveDoubt(uid, doubt);
    },
    [uid, isGuest]
  );

  const resolveDoubt = useCallback(
    async (doubtId: string, updates: Partial<Doubt>): Promise<void> => {
      if (!uid || isGuest) return;
      await updateDoubt(uid, doubtId, updates);
    },
    [uid, isGuest]
  );

  return { doubts, loading, error, addDoubt, resolveDoubt };
}

// ============================================================================
// Notes Hook
// ============================================================================

interface UseNotesResult {
  notes: GeneratedNote[];
  loading: boolean;
  error: Error | null;
  addNote: (note: GeneratedNote) => Promise<string>;
  removeNote: (noteId: string) => Promise<void>;
}

/**
 * Hook to manage notes with real-time sync.
 */
export function useNotes(): UseNotesResult {
  const [notes, setNotes] = useState<GeneratedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<Error | null>(null);

  const user = useAuthStore((s) => s.user);
  const isGuest = useAuthStore((s) => s.isGuest);
  const uid = user?.id;

  useEffect(() => {
    if (!uid || isGuest) {
      setNotes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToNotes(uid, (data) => {
      setNotes(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid, isGuest]);

  const addNote = useCallback(
    async (note: GeneratedNote): Promise<string> => {
      if (!uid || isGuest) throw new Error('Must be logged in');
      return saveNote(uid, note);
    },
    [uid, isGuest]
  );

  const removeNote = useCallback(
    async (noteId: string): Promise<void> => {
      if (!uid || isGuest) return;
      await deleteNote(uid, noteId);
    },
    [uid, isGuest]
  );

  return { notes, loading, error, addNote, removeNote };
}

// ============================================================================
// Flashcards Hook
// ============================================================================

interface UseFlashcardsResult {
  flashcards: Flashcard[];
  loading: boolean;
  error: Error | null;
  addFlashcards: (cards: Flashcard[]) => Promise<void>;
  updateCard: (cardId: string, updates: Partial<Flashcard>) => Promise<void>;
  removeCard: (cardId: string) => Promise<void>;
}

/**
 * Hook to manage flashcards with real-time sync.
 */
export function useFlashcards(sessionId?: string): UseFlashcardsResult {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<Error | null>(null);

  const user = useAuthStore((s) => s.user);
  const isGuest = useAuthStore((s) => s.isGuest);
  const uid = user?.id;

  useEffect(() => {
    if (!uid || isGuest) {
      setFlashcards([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToFlashcards(uid, (data) => {
      setFlashcards(data);
      setLoading(false);
    }, sessionId);

    return () => unsubscribe();
  }, [uid, isGuest, sessionId]);

  const addFlashcards = useCallback(
    async (cards: Flashcard[]): Promise<void> => {
      if (!uid || isGuest) throw new Error('Must be logged in');
      await saveFlashcards(uid, cards);
    },
    [uid, isGuest]
  );

  const updateCard = useCallback(
    async (cardId: string, updates: Partial<Flashcard>): Promise<void> => {
      if (!uid || isGuest) return;
      await updateFlashcard(uid, cardId, updates);
    },
    [uid, isGuest]
  );

  const removeCard = useCallback(
    async (cardId: string): Promise<void> => {
      if (!uid || isGuest) return;
      await deleteFlashcard(uid, cardId);
    },
    [uid, isGuest]
  );

  return { flashcards, loading, error, addFlashcards, updateCard, removeCard };
}

// ============================================================================
// Mind Maps Hook
// ============================================================================

interface UseMindMapsResult {
  mindMaps: MindMap[];
  loading: boolean;
  error: Error | null;
  addMindMap: (map: MindMap) => Promise<string>;
  removeMindMap: (mapId: string) => Promise<void>;
}

/**
 * Hook to manage mind maps with real-time sync.
 */
export function useMindMaps(): UseMindMapsResult {
  const [mindMaps, setMindMaps] = useState<MindMap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<Error | null>(null);

  const user = useAuthStore((s) => s.user);
  const isGuest = useAuthStore((s) => s.isGuest);
  const uid = user?.id;

  useEffect(() => {
    if (!uid || isGuest) {
      setMindMaps([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToMindMaps(uid, (data) => {
      setMindMaps(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid, isGuest]);

  const addMindMap = useCallback(
    async (map: MindMap): Promise<string> => {
      if (!uid || isGuest) throw new Error('Must be logged in');
      return saveMindMap(uid, map);
    },
    [uid, isGuest]
  );

  const removeMindMap = useCallback(
    async (mapId: string): Promise<void> => {
      if (!uid || isGuest) return;
      await deleteMindMap(uid, mapId);
    },
    [uid, isGuest]
  );

  return { mindMaps, loading, error, addMindMap, removeMindMap };
}

// ============================================================================
// Sync Status Hook
// ============================================================================

interface UseSyncStatusResult {
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncError: Error | null;
}

/**
 * Hook to track backend sync status.
 */
export function useSyncStatus(): UseSyncStatusResult {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<Error | null>(null);

  const user = useAuthStore((s) => s.user);
  const isGuest = useAuthStore((s) => s.isGuest);
  const uid = user?.id;

  useEffect(() => {
    if (!uid || isGuest) return;

    // Track sync status through user subscription
    setIsSyncing(true);
    const unsubscribe = subscribeToUserData(
      uid,
      () => {
        setIsSyncing(false);
        setLastSyncTime(new Date());
        setSyncError(null);
      },
      (error) => {
        setIsSyncing(false);
        setSyncError(error);
      }
    );

    return () => unsubscribe();
  }, [uid, isGuest]);

  return { isSyncing, lastSyncTime, syncError };
}

// ============================================================================
// Auto-Save Hook
// ============================================================================

interface UseAutoSaveOptions {
  debounceMs?: number;
  onSave?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to automatically save data with debouncing.
 */
export function useAutoSave<T>(
  data: T,
  saveFn: (data: T) => Promise<void>,
  options: UseAutoSaveOptions = {}
): { isSaving: boolean; lastSaved: Date | null; error: Error | null } {
  const { debounceMs = 1000, onSave, onError } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        await saveFn(dataRef.current);
        setLastSaved(new Date());
        setError(null);
        onSave?.();
      } catch (err) {
        const e = err instanceof Error ? err : new Error('Save failed');
        setError(e);
        onError?.(e);
      } finally {
        setIsSaving(false);
      }
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, saveFn, debounceMs, onSave, onError]);

  return { isSaving, lastSaved, error };
}
