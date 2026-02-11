/**
 * Offline queue: when offline (or a write fails), queue create/update/delete ops
 * in IndexedDB (or memory) and retry when back online.
 */

const DB_NAME = 'aira_offline_queue';
const STORE_NAME = 'queue';
const DB_VERSION = 1;

export type QueuedOp =
  | { op: 'saveNote'; payload: { uid: string; note: unknown } }
  | { op: 'updateNote'; payload: { uid: string; noteId: string; updates: unknown } }
  | { op: 'deleteNote'; payload: { uid: string; noteId: string } }
  | { op: 'updateUserProfile'; payload: { uid: string; profile: unknown } }
  | { op: 'updateUserSettings'; payload: { uid: string; settings: unknown } }
  | { op: 'updateNotePinArchive'; payload: { uid: string; noteId: string; pinned?: boolean; archived?: boolean } }
  | { op: 'saveDoubt'; payload: { uid: string; doubt: unknown } }
  | { op: 'updateDoubt'; payload: { uid: string; doubtId: string; updates: unknown } }
  | { op: 'createTeachingSession'; payload: { uid: string; session: unknown } }
  | { op: 'updateTeachingSession'; payload: { uid: string; sessionId: string; updates: unknown } }
  | { op: 'addSessionAnalytics'; payload: { uid: string; session: unknown } }
  | { op: 'updateAnalytics'; payload: { uid: string; analytics: unknown } };

export interface QueueItem {
  id: string;
  op: string;
  payload: unknown;
  createdAt: string;
}

let db: IDBDatabase | null = null;
let pendingCount = 0;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((cb) => {
    try {
      cb();
    } catch (e) {
      console.error('offlineQueue listener error', e);
    }
  });
}

function openDb(): Promise<IDBDatabase> {
  if (db) return Promise.resolve(db);
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        db = request.result;
        resolve(db);
      };
      request.onupgradeneeded = (e) => {
        const database = (e.target as IDBOpenDBRequest).result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    } catch (e) {
      reject(e);
    }
  });
}

/** In-memory fallback when IndexedDB is unavailable */
const memoryQueue: QueueItem[] = [];
let useMemory = false;

function getId(): string {
  return `q_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function addToQueue(item: Omit<QueueItem, 'id' | 'createdAt'>): Promise<string> {
  const id = getId();
  const record: QueueItem = {
    id,
    op: item.op,
    payload: item.payload,
    createdAt: new Date().toISOString(),
  };

  try {
    const database = await openDb();
    return new Promise((resolve, reject) => {
      const tx = database.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.add(record);
      tx.oncomplete = () => {
        pendingCount += 1;
        notifyListeners();
        resolve(id);
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    useMemory = true;
    memoryQueue.push(record);
    pendingCount += 1;
    notifyListeners();
    return id;
  }
}

export async function getAllQueued(): Promise<QueueItem[]> {
  if (useMemory) return [...memoryQueue];

  try {
    const database = await openDb();
    return new Promise((resolve, reject) => {
      const tx = database.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result ?? []);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [...memoryQueue];
  }
}

export async function removeFromQueue(id: string): Promise<void> {
  if (useMemory) {
    const idx = memoryQueue.findIndex((i) => i.id === id);
    if (idx !== -1) {
      memoryQueue.splice(idx, 1);
      pendingCount = Math.max(0, pendingCount - 1);
      notifyListeners();
    }
    return;
  }

  try {
    const database = await openDb();
    return new Promise((resolve, reject) => {
      const tx = database.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
      tx.oncomplete = () => {
        pendingCount = Math.max(0, pendingCount - 1);
        notifyListeners();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    pendingCount = Math.max(0, pendingCount - 1);
    notifyListeners();
  }
}

export async function refreshPendingCount(): Promise<number> {
  const items = await getAllQueued();
  pendingCount = items.length;
  notifyListeners();
  return pendingCount;
}

export function getPendingCount(): number {
  return pendingCount;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine;
}
