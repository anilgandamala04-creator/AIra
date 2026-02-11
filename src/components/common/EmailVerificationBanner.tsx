import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, X, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { toast } from '../../stores/toastStore';

/**
 * Banner shown when user is signed in with email and email is not verified.
 * Offers "Verify your email" (sends verification) and link to Settings.
 */
export default function EmailVerificationBanner() {
  const { user, sendEmailVerification, reloadUser } = useAuthStore();
  const [sending, setSending] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const isEmailUnverified =
    user?.authMethod === 'email' && user?.id && !user?.isVerified;

  if (!isEmailUnverified || dismissed) return null;

  const handleSendVerification = async () => {
    setSending(true);
    const { error } = await sendEmailVerification();
    setSending(false);
    if (error) {
      toast.error(error.message || 'Failed to send verification email');
      return;
    }
    toast.success('Verification email sent. Check your inbox.');
  };

  const handleRefreshed = async () => {
    await reloadUser();
    if (useAuthStore.getState().user?.isVerified) {
      setDismissed(true);
      toast.success('Email verified!');
    }
  };

  return (
    <div
      role="banner"
      className="flex items-center gap-3 px-3 py-2 sm:px-4 sm:py-2.5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100 text-sm"
    >
      <Mail className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-medium">Verify your email</p>
        <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
          Check your inbox for a verification link, or request a new one.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleRefreshed}
          className="px-2 py-1.5 text-xs font-medium bg-amber-200/80 dark:bg-amber-800/60 hover:bg-amber-300 dark:hover:bg-amber-700 rounded-lg transition-colors"
        >
          I&apos;ve verified
        </button>
        <button
          type="button"
          onClick={handleSendVerification}
          disabled={sending}
          className="px-3 py-1.5 text-xs font-medium bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
        >
          {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
          {sending ? 'Sending…' : 'Send again'}
        </button>
        <Link
          to="/settings"
          className="px-2 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 hover:underline"
        >
          Settings
        </Link>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1.5 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-200/60 dark:hover:bg-amber-800/40 transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
