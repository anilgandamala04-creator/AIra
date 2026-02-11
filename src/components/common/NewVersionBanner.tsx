import { RefreshCw } from 'lucide-react';
import { useVersionCheck } from '../../hooks/useVersionCheck';

/**
 * Banner shown when a new deploy is detected. Prompts user to refresh.
 */
export default function NewVersionBanner() {
  const newVersionAvailable = useVersionCheck();

  if (!newVersionAvailable) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[150] flex items-center justify-between gap-4 px-4 py-2 bg-purple-600 text-white shadow-lg safe-top"
      style={{ top: 'max(0px, env(safe-area-inset-top))' }}
      role="region"
      aria-live="polite"
      aria-label="New version available"
    >
      <p className="text-sm font-medium truncate">New version available. Refresh to update.</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors shrink-0"
      >
        <RefreshCw className="w-4 h-4" />
        Refresh
      </button>
    </div>
  );
}
