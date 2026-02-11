import { Cookie, ExternalLink } from 'lucide-react';
import { useConsentStore } from '../../stores/consentStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { PRIVACY_POLICY_URL } from '../../constants/app';

/**
 * First-visit GDPR-style consent banner. Accept/decline analytics; optionally marketing.
 * Only enable analytics when user accepts.
 */
export default function ConsentBanner() {
  const { hasConsented, setConsent } = useConsentStore();
  const updatePrivacy = useSettingsStore((s) => s.updatePrivacy);
  if (hasConsented) return null;

  const handleAccept = () => {
    setConsent(true, false);
    updatePrivacy({ analyticsEnabled: true });
  };

  const handleDecline = () => {
    setConsent(false, false);
    updatePrivacy({ analyticsEnabled: false });
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[145] p-4 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 shadow-lg safe-bottom"
      style={{ bottom: 'max(0px, env(safe-area-inset-bottom))' }}
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="max-w-2xl mx-auto">
        <div className="flex items-start gap-3">
          <Cookie className="w-6 h-6 text-purple-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-800 dark:text-slate-100">We use cookies</p>
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
              We use analytics cookies to improve the app. You can accept or decline. See our{' '}
              <a href={PRIVACY_POLICY_URL} className="text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1">
                Privacy Policy
                <ExternalLink className="w-3 h-3" />
              </a>.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                type="button"
                onClick={handleAccept}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Accept analytics
              </button>
              <button
                type="button"
                onClick={handleDecline}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
