import { useState } from 'react';
import { Download, X } from 'lucide-react';
import { useInstallPromptStore } from '../../stores/installPromptStore';
import { logAppEvent, ANALYTICS_EVENTS } from '../../lib/analytics';

/**
 * Optional "Add to home screen" banner. Shown when the browser fires beforeinstallprompt
 * and user hasn't dismissed/installed yet. Can be shown after first session or in Settings.
 */
export default function InstallPromptBanner() {
  const { installPrompt, setInstallPrompt, dismissedOrInstalled, setDismissedOrInstalled } = useInstallPromptStore();
  const [installing, setInstalling] = useState(false);

  const show = installPrompt && !dismissedOrInstalled && !installing;

  const handleInstall = async () => {
    if (!installPrompt) return;
    setInstalling(true);
    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setDismissedOrInstalled(true);
        logAppEvent(ANALYTICS_EVENTS.PWA_INSTALLED);
      }
      setInstallPrompt(null);
    } catch {
      // ignore
    } finally {
      setInstalling(false);
    }
  };

  const handleDismiss = () => {
    setDismissedOrInstalled(true);
    setInstallPrompt(null);
  };

  if (!show) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-[140] flex items-center gap-3 p-3 bg-slate-800 text-white rounded-xl shadow-lg safe-bottom"
      style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      role="region"
      aria-label="Install app"
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">Install AI Tutor</p>
        <p className="text-xs text-slate-300 truncate">Open like an app from your home screen</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={handleInstall}
          className="p-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white"
          aria-label="Install app"
        >
          <Download className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="p-2 rounded-lg text-slate-400 hover:bg-slate-700"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
