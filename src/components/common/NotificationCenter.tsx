import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle, AlertCircle, Info, AlertTriangle, Trash2 } from 'lucide-react';
import { useToastStore, type NotificationEntry } from '../../stores/toastStore';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
  success: 'text-green-600 dark:text-green-400',
  error: 'text-red-600 dark:text-red-400',
  info: 'text-blue-600 dark:text-blue-400',
  warning: 'text-amber-600 dark:text-amber-400',
};

function formatTimeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { history, clearHistory } = useToastStore();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-lg text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="w-5 h-5" />
        {history.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-purple-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {history.length > 9 ? '9+' : history.length}
          </span>
        )}
      </button>
      {open && (
        <div
          className="absolute right-0 sm:right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-80 max-h-96 overflow-hidden bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 z-50 flex flex-col"
          role="menu"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-700">
            <h3 className="font-semibold text-gray-800 dark:text-slate-100">Notifications</h3>
            {history.length > 0 && (
              <button
                type="button"
                onClick={clearHistory}
                className="p-1.5 rounded text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                aria-label="Clear history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="overflow-y-auto flex-1 min-h-0">
            {history.length === 0 ? (
              <p className="px-4 py-8 text-sm text-gray-500 dark:text-slate-400 text-center">No notifications yet</p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-slate-700">
                {history.map((entry: NotificationEntry) => {
                  const Icon = icons[entry.type];
                  return (
                    <li key={entry.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <div className="flex gap-3">
                        <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${colors[entry.type]}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-gray-800 dark:text-slate-200">{entry.message}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{formatTimeAgo(entry.timestamp)}</p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
