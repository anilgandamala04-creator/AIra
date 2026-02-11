import { useEffect } from 'react';
import { CloudOff, Loader2 } from 'lucide-react';
import { useOfflineQueueStore } from '../../stores/offlineQueueStore';

/**
 * Shows "X pending – will sync when online" when there are queued writes.
 * Mount once in the app (e.g. near the header or toast area).
 */
export default function OfflinePendingIndicator() {
  const { pendingCount, isSyncing, refresh } = useOfflineQueueStore();

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (pendingCount <= 0) return null;

  return (
    <div
      className="fixed bottom-4 left-4 z-[150] flex items-center gap-2 py-2 px-3 rounded-lg bg-slate-800 text-white text-sm shadow-lg safe-bottom"
      style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      role="status"
      aria-live="polite"
    >
      {isSyncing ? (
        <Loader2 className="w-4 h-4 shrink-0 animate-spin" aria-hidden />
      ) : (
        <CloudOff className="w-4 h-4 shrink-0" aria-hidden />
      )}
      <span>
        {isSyncing
          ? `Syncing ${pendingCount} change${pendingCount === 1 ? '' : 's'}…`
          : `${pendingCount} pending – will sync when online`}
      </span>
    </div>
  );
}
