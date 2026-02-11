import { create } from 'zustand';
import { getPendingCount, refreshPendingCount, subscribe as subscribeQueue } from '../utils/offlineQueue';
import { getProcessingState, subscribeToProcessingState } from '../utils/offlineQueueProcessor';

interface OfflineQueueState {
  pendingCount: number;
  isSyncing: boolean;
  refresh: () => Promise<number>;
}

let unsubQueue: (() => void) | null = null;

export const useOfflineQueueStore = create<OfflineQueueState>((set) => ({
  pendingCount: getPendingCount(),
  isSyncing: getProcessingState() === 'syncing',

  refresh: async () => {
    const count = await refreshPendingCount();
    set({ pendingCount: count });
    return count;
  },
}));

function init() {
  if (unsubQueue) return;
  unsubQueue = subscribeQueue(() => {
    useOfflineQueueStore.setState({ pendingCount: getPendingCount() });
  });
  subscribeToProcessingState((state) => {
    useOfflineQueueStore.setState({ isSyncing: state === 'syncing' });
  });
}

init();
