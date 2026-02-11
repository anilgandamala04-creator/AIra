/**
 * Wraps backend writes so that when offline or when the request fails,
 * the op is queued and will sync when back online.
 */

import * as backend from './backendService';
import { addToQueue, isOnline } from '../utils/offlineQueue';
import { toast } from '../stores/toastStore';
import type { GeneratedNote, Doubt, TeachingSession, SessionAnalytics, UserProfile, AppSettings, Achievement, ProgressMetrics } from '../types';

const QUEUED_MESSAGE = 'Saved locally; will sync when online';

function isNetworkError(e: unknown): boolean {
  if (!e || typeof e !== 'object') return false;
  const msg = (e as Error).message?.toLowerCase() ?? '';
  return (
    msg.includes('network') ||
    msg.includes('failed to fetch') ||
    msg.includes('offline') ||
    (e as { code?: string }).code === 'unavailable'
  );
}

export async function saveNoteWithOfflineQueue(uid: string, note: GeneratedNote): Promise<string> {
  if (isOnline()) {
    try {
      return await backend.saveNote(uid, note);
    } catch (e) {
      if (isNetworkError(e)) {
        await addToQueue({ op: 'saveNote', payload: { uid, note } });
        toast.info(QUEUED_MESSAGE);
        return note.id;
      }
      throw e;
    }
  }
  await addToQueue({ op: 'saveNote', payload: { uid, note } });
  toast.info(QUEUED_MESSAGE);
  return note.id;
}

export async function updateNoteWithOfflineQueue(
  uid: string,
  noteId: string,
  updates: Partial<GeneratedNote>
): Promise<void> {
  if (isOnline()) {
    try {
      await backend.updateNote(uid, noteId, updates);
      return;
    } catch (e) {
      if (isNetworkError(e)) {
        await addToQueue({ op: 'updateNote', payload: { uid, noteId, updates } });
        toast.info(QUEUED_MESSAGE);
        return;
      }
      throw e;
    }
  }
  await addToQueue({ op: 'updateNote', payload: { uid, noteId, updates } });
  toast.info(QUEUED_MESSAGE);
}

export async function deleteNoteWithOfflineQueue(uid: string, noteId: string): Promise<void> {
  if (isOnline()) {
    try {
      await backend.deleteNote(uid, noteId);
      return;
    } catch (e) {
      if (isNetworkError(e)) {
        await addToQueue({ op: 'deleteNote', payload: { uid, noteId } });
        toast.info(QUEUED_MESSAGE);
        return;
      }
      throw e;
    }
  }
  await addToQueue({ op: 'deleteNote', payload: { uid, noteId } });
  toast.info(QUEUED_MESSAGE);
}

export async function updateNotePinArchiveWithOfflineQueue(
  uid: string,
  noteId: string,
  pinned?: boolean,
  archived?: boolean
): Promise<void> {
  const updates: Partial<GeneratedNote> = {};
  if (pinned !== undefined) updates.pinned = pinned;
  if (archived !== undefined) updates.archived = archived;
  return updateNoteWithOfflineQueue(uid, noteId, updates);
}

export async function saveDoubtWithOfflineQueue(uid: string, doubt: Doubt): Promise<string> {
  if (isOnline()) {
    try {
      return await backend.saveDoubt(uid, doubt);
    } catch (e) {
      if (isNetworkError(e)) {
        await addToQueue({ op: 'saveDoubt', payload: { uid, doubt } });
        toast.info(QUEUED_MESSAGE);
        return doubt.id;
      }
      throw e;
    }
  }
  await addToQueue({ op: 'saveDoubt', payload: { uid, doubt } });
  toast.info(QUEUED_MESSAGE);
  return doubt.id;
}

export async function updateDoubtWithOfflineQueue(
  uid: string,
  doubtId: string,
  updates: Partial<Doubt>
): Promise<void> {
  if (isOnline()) {
    try {
      await backend.updateDoubt(uid, doubtId, updates);
      return;
    } catch (e) {
      if (isNetworkError(e)) {
        await addToQueue({ op: 'updateDoubt', payload: { uid, doubtId, updates } });
        toast.info(QUEUED_MESSAGE);
        return;
      }
      throw e;
    }
  }
  await addToQueue({ op: 'updateDoubt', payload: { uid, doubtId, updates } });
  toast.info(QUEUED_MESSAGE);
}

export async function createTeachingSessionWithOfflineQueue(uid: string, session: TeachingSession): Promise<string> {
  if (isOnline()) {
    try {
      return await backend.createTeachingSession(uid, session);
    } catch (e) {
      if (isNetworkError(e)) {
        await addToQueue({ op: 'createTeachingSession', payload: { uid, session } });
        toast.info(QUEUED_MESSAGE);
        return session.id;
      }
      throw e;
    }
  }
  await addToQueue({ op: 'createTeachingSession', payload: { uid, session } });
  toast.info(QUEUED_MESSAGE);
  return session.id;
}

export async function updateTeachingSessionWithOfflineQueue(
  uid: string,
  sessionId: string,
  updates: Partial<TeachingSession>
): Promise<void> {
  if (isOnline()) {
    try {
      await backend.updateTeachingSession(uid, sessionId, updates);
      return;
    } catch (e) {
      if (isNetworkError(e)) {
        await addToQueue({ op: 'updateTeachingSession', payload: { uid, sessionId, updates } });
        toast.info(QUEUED_MESSAGE);
        return;
      }
      throw e;
    }
  }
  await addToQueue({ op: 'updateTeachingSession', payload: { uid, sessionId, updates } });
  toast.info(QUEUED_MESSAGE);
}

export async function addSessionAnalyticsWithOfflineQueue(uid: string, session: SessionAnalytics): Promise<void> {
  if (isOnline()) {
    try {
      await backend.addSessionAnalytics(uid, session);
      return;
    } catch (e) {
      if (isNetworkError(e)) {
        await addToQueue({ op: 'addSessionAnalytics', payload: { uid, session } });
        toast.info(QUEUED_MESSAGE);
        return;
      }
      throw e;
    }
  }
  await addToQueue({ op: 'addSessionAnalytics', payload: { uid, session } });
  toast.info(QUEUED_MESSAGE);
}

export async function updateUserProfileWithOfflineQueue(uid: string, profile: UserProfile): Promise<void> {
  if (isOnline()) {
    try {
      await backend.updateUserProfile(uid, profile);
      return;
    } catch (e) {
      if (isNetworkError(e)) {
        await addToQueue({ op: 'updateUserProfile', payload: { uid, profile } });
        toast.info(QUEUED_MESSAGE);
        return;
      }
      throw e;
    }
  }
  await addToQueue({ op: 'updateUserProfile', payload: { uid, profile } });
  toast.info(QUEUED_MESSAGE);
}

export async function updateUserSettingsWithOfflineQueue(uid: string, settings: Partial<AppSettings>): Promise<void> {
  if (isOnline()) {
    try {
      await backend.updateUserSettings(uid, settings);
      return;
    } catch (e) {
      if (isNetworkError(e)) {
        await addToQueue({ op: 'updateUserSettings', payload: { uid, settings } });
        toast.info(QUEUED_MESSAGE);
        return;
      }
      throw e;
    }
  }
  await addToQueue({ op: 'updateUserSettings', payload: { uid, settings } });
  toast.info(QUEUED_MESSAGE);
}

export async function updateAnalyticsWithOfflineQueue(
  uid: string,
  analytics: { sessions: SessionAnalytics[]; achievements: Achievement[]; metrics: ProgressMetrics }
): Promise<void> {
  if (isOnline()) {
    try {
      await backend.updateUserAnalytics(uid, analytics);
      return;
    } catch (e) {
      if (isNetworkError(e)) {
        await addToQueue({ op: 'updateAnalytics', payload: { uid, analytics } });
        toast.info(QUEUED_MESSAGE);
        return;
      }
      throw e;
    }
  }
  await addToQueue({ op: 'updateAnalytics', payload: { uid, analytics } });
  toast.info(QUEUED_MESSAGE);
}
