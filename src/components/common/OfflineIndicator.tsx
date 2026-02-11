import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

/**
 * Shows a small banner when the app is offline (navigator.onLine is false)
 * or when a fetch to a known endpoint fails, so users know why actions might fail
 * and when they're back online.
 */
export default function OfflineIndicator() {
  const [offline, setOffline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setOffline(false);
      setWasOffline(true);
    };

    const handleOffline = () => setOffline(true);

    const online = typeof navigator !== 'undefined' && navigator.onLine;
    setOffline(!online);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Clear "back online" message after a short time
  useEffect(() => {
    if (!wasOffline || offline) return;
    const t = setTimeout(() => setWasOffline(false), 4000);
    return () => clearTimeout(t);
  }, [wasOffline, offline]);

  if (!offline && !wasOffline) return null;

  if (wasOffline && !offline) {
    return (
      <div
        className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-center gap-2 py-2 px-4 bg-emerald-600 text-white text-sm font-medium safe-top"
        style={{ top: 'max(0px, env(safe-area-inset-top))' }}
        role="status"
        aria-live="polite"
      >
        <span>You're back online.</span>
      </div>
    );
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-center gap-2 py-2 px-4 bg-amber-600 text-white text-sm font-medium safe-top"
      style={{ top: 'max(0px, env(safe-area-inset-top))' }}
      role="alert"
      aria-live="assertive"
    >
      <WifiOff className="w-4 h-4 shrink-0" aria-hidden />
      <span>You're offline. Some actions may not work until you're back online.</span>
    </div>
  );
}
