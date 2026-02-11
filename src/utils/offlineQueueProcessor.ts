/**
 * Processes the offline queue when the app comes back online:
 * runs each queued op against the backend and removes it on success.
 */

import { getAllQueued, removeFromQueue } from './offlineQueue';
import type { QueueItem } from './offlineQueue';
import type { GeneratedNote, Doubt, TeachingSession, SessionAnalytics } from '../types';

export type ProcessingState = 'idle' | 'syncing' | 'error';
const stateListeners = new Set<(state: ProcessingState) => void>();
let processingState: ProcessingState = 'idle';

export function getProcessingState(): ProcessingState {
  return processingState;
}

export function subscribeToProcessingState(listener: (state: ProcessingState) => void): () => void {
  stateListeners.add(listener);
  return () => stateListeners.delete(listener);
}

function setState(s: ProcessingState) {
  processingState = s;
  stateListeners.forEach((cb) => cb(s));
}

export async function processQueue(): Promise<{ processed: number; failed: number }> {
  if (processingState === 'syncing') return { processed: 0, failed: 0 };

  const items = await getAllQueued();
  if (items.length === 0) return { processed: 0, failed: 0 };

  setState('syncing');
  const backend = await import('../services/backendService');
  let processed = 0;
  let failed = 0;

  for (const item of items) {
    try {
      await processItem(backend as BackendForQueue, item);
      await removeFromQueue(item.id);
      processed += 1;
    } catch (e) {
      console.warn('Offline queue item failed, will retry later:', item.op, e);
      failed += 1;
    }
  }

  setState(failed > 0 ? 'error' : 'idle');
  return { processed, failed };
}

type BackendForQueue = {
  saveNote: (uid: string, note: GeneratedNote) => Promise<string>;
  updateNote: (uid: string, noteId: string, updates: Partial<GeneratedNote>) => Promise<void>;
  deleteNote: (uid: string, noteId: string) => Promise<void>;
  updateUserProfile: (uid: string, profile: unknown) => Promise<void>;
  updateUserSettings: (uid: string, settings: unknown) => Promise<void>;
  saveDoubt: (uid: string, doubt: Doubt) => Promise<string>;
  updateDoubt: (uid: string, doubtId: string, updates: Partial<Doubt>) => Promise<void>;
  createTeachingSession: (uid: string, session: TeachingSession) => Promise<string>;
  updateTeachingSession: (uid: string, sessionId: string, updates: Partial<TeachingSession>) => Promise<void>;
  addSessionAnalytics: (uid: string, session: SessionAnalytics) => Promise<void>;
  updateUserAnalytics: (uid: string, analytics: unknown) => Promise<void>;
};

async function processItem(backend: BackendForQueue, item: QueueItem): Promise<void> {
  const payload = item.payload as Record<string, unknown>;
  const uid = payload?.uid as string;
  if (!uid) return;

  switch (item.op) {
    case 'saveNote':
      await backend.saveNote(uid, payload.note as GeneratedNote);
      break;
    case 'updateNote':
      await backend.updateNote(uid, payload.noteId as string, (payload.updates ?? {}) as Partial<GeneratedNote>);
      break;
    case 'deleteNote':
      await backend.deleteNote(uid, payload.noteId as string);
      break;
    case 'updateUserProfile':
      await backend.updateUserProfile(uid, payload.profile);
      break;
    case 'updateUserSettings':
      await backend.updateUserSettings(uid, payload.settings);
      break;
    case 'updateNotePinArchive': {
      const noteId = payload.noteId as string;
      const updates: { pinned?: boolean; archived?: boolean } = {};
      if (payload.pinned !== undefined) updates.pinned = payload.pinned as boolean;
      if (payload.archived !== undefined) updates.archived = payload.archived as boolean;
      await backend.updateNote(uid, noteId, updates);
      break;
    }
    case 'saveDoubt':
      await backend.saveDoubt(uid, payload.doubt as Doubt);
      break;
    case 'updateDoubt':
      await backend.updateDoubt(uid, payload.doubtId as string, (payload.updates ?? {}) as Partial<Doubt>);
      break;
    case 'createTeachingSession':
      await backend.createTeachingSession(uid, payload.session as TeachingSession);
      break;
    case 'updateTeachingSession':
      await backend.updateTeachingSession(uid, payload.sessionId as string, (payload.updates ?? {}) as Partial<TeachingSession>);
      break;
    case 'addSessionAnalytics':
      await backend.addSessionAnalytics(uid, payload.session as SessionAnalytics);
      break;
    case 'updateAnalytics':
      await backend.updateUserAnalytics(uid, payload.analytics);
      break;
    default:
      console.warn('Unknown queue op:', item.op);
  }
}
