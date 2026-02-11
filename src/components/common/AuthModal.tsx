import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Mail, Loader2 } from 'lucide-react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useAuthStore } from '../../stores/authStore';
import type { UserRole } from '../../types';
import { validateEmail, validatePassword } from '../../utils/validation';
import { toast } from '../../stores/toastStore';
import PasswordField from './PasswordField';
import { getRecaptchaToken } from '../../utils/recaptcha';

interface AuthModalProps {
  onClose: () => void;
  defaultRole: UserRole;
}

export default function AuthModal({ onClose, defaultRole }: AuthModalProps) {
  const navigate = useNavigate();
  const { setPendingLoginRole, signInWithEmail, signUpWithEmail, sendMagicLink } = useAuthStore();

  const [mode, setMode] = useState<'signin' | 'signup' | 'magic'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, { initialFocus: true });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      toast.error(emailCheck.error ?? 'Invalid email');
      return;
    }
    if (!password.trim()) {
      toast.error('Enter your password');
      return;
    }
    try {
      await getRecaptchaToken('signin');
    } catch { /* optional when key not set */ }
    setPendingLoginRole(defaultRole);
    setLoading(true);
    const { error } = await signInWithEmail(email.trim(), password);
    setLoading(false);
    if (error) {
      toast.error(error.message || 'Sign in failed');
      return;
    }
    toast.success('Signed in');
    onClose();
    if (defaultRole === 'student') navigate('/', { replace: true });
    else if (defaultRole === 'teacher') navigate('/teacher', { replace: true });
    else navigate('/admin', { replace: true });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ageConfirmed) {
      toast.error('You must be 13 or older to create an account.');
      return;
    }
    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      toast.error(emailCheck.error ?? 'Invalid email');
      return;
    }
    const pwCheck = validatePassword(password, 8);
    if (!pwCheck.isValid) {
      toast.error(pwCheck.error ?? 'Invalid password');
      return;
    }
    try {
      await getRecaptchaToken('signup');
    } catch { /* optional when key not set */ }
    setPendingLoginRole(defaultRole);
    setLoading(true);
    const { error } = await signUpWithEmail(email.trim(), password, displayName.trim() || undefined);
    setLoading(false);
    if (error) {
      toast.error(error.message || 'Sign up failed');
      return;
    }
    toast.success('Account created. Check your email to verify.');
    onClose();
    if (defaultRole === 'student') navigate('/', { replace: true });
    else if (defaultRole === 'teacher') navigate('/teacher', { replace: true });
    else navigate('/admin', { replace: true });
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      toast.error(emailCheck.error ?? 'Invalid email');
      return;
    }
    setPendingLoginRole(defaultRole);
    setLoading(true);
    const { error } = await sendMagicLink(email.trim());
    setLoading(false);
    if (error) {
      toast.error(error.message || 'Failed to send link');
      return;
    }
    toast.success('Check your email for the sign-in link.');
    onClose();
  };

  return (
    <div ref={modalRef} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-700">
          <h2 id="auth-modal-title" className="text-lg font-semibold text-gray-800 dark:text-slate-100">
            {mode === 'signin' ? 'Sign in with Email' : mode === 'magic' ? 'Email sign-in link' : 'Create account'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          {mode === 'magic' ? (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-slate-400">We&apos;ll send a one-time sign-in link to your email. No password needed.</p>
              <div>
                <label htmlFor="auth-email-magic" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                  <input
                    id="auth-email-magic"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg dark:text-slate-100"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium rounded-lg flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Email me a sign-in link
              </button>
            </form>
          ) : (
          <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
            <div>
              <label htmlFor="auth-email" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg dark:text-slate-100"
                  autoComplete="email"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="auth-password" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <PasswordField
                id="auth-password"
                value={password}
                onChange={setPassword}
                placeholder={mode === 'signup' ? 'At least 8 characters, upper, lower, number' : 'Password'}
                showStrength={mode === 'signup'}
                minLength={8}
              />
            </div>
            {mode === 'signup' && (
              <>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ageConfirmed}
                    onChange={(e) => setAgeConfirmed(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-slate-300">I am 13 years or older</span>
                </label>
                <div>
                <label htmlFor="auth-display-name" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Display name (optional)
                </label>
                <input
                  id="auth-display-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How we'll call you"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg dark:text-slate-100"
                  autoComplete="name"
                />
              </div>
              </>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium rounded-lg flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'signin' ? 'Sign in' : 'Sign up'}
            </button>
          </form>
          )}
          <p className="text-center text-sm text-gray-500 dark:text-slate-400">
            {mode === 'magic' ? (
              <>
                <button type="button" onClick={() => setMode('signin')} className="text-purple-600 dark:text-purple-400 font-medium hover:underline">
                  Back to password sign in
                </button>
              </>
            ) : mode === 'signin' ? (
              <>
                Don&apos;t have an account?{' '}
                <button type="button" onClick={() => setMode('signup')} className="text-purple-600 dark:text-purple-400 font-medium hover:underline">
                  Sign up
                </button>
                {' · '}
                <button type="button" onClick={() => setMode('magic')} className="text-purple-600 dark:text-purple-400 font-medium hover:underline">
                  Email me a sign-in link
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button type="button" onClick={() => setMode('signin')} className="text-purple-600 dark:text-purple-400 font-medium hover:underline">
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
