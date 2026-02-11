/**
 * Optional reCAPTCHA v3 for login/signup to reduce bots and brute force.
 * Set VITE_RECAPTCHA_V3_SITE_KEY in env to enable. Token can be sent to your backend
 * for verification. Firebase Console > Authentication > Settings > App Verification
 * can also be enabled for built-in protection.
 */

const SITE_KEY = typeof import.meta.env?.VITE_RECAPTCHA_V3_SITE_KEY === 'string'
  ? import.meta.env.VITE_RECAPTCHA_V3_SITE_KEY
  : '';

let grecaptchaReady: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (grecaptchaReady) return grecaptchaReady;
  if (!SITE_KEY) return Promise.resolve();
  grecaptchaReady = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') { resolve(); return; }
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('reCAPTCHA script failed to load'));
    document.head.appendChild(script);
  });
  return grecaptchaReady;
}

declare global {
  interface Window {
    grecaptcha?: { ready: (cb: () => void) => void; execute: (siteKey: string, options: { action: string }) => Promise<string> };
  }
}

/**
 * Returns a reCAPTCHA v3 token for the given action, or null if not configured or on error.
 * Send the token to your backend and verify with the secret key.
 */
export async function getRecaptchaToken(action: string): Promise<string | null> {
  if (!SITE_KEY) return null;
  try {
    await loadScript();
    return new Promise((resolve) => {
      if (!window.grecaptcha) { resolve(null); return; }
      window.grecaptcha.ready(() => {
        window.grecaptcha!.execute(SITE_KEY, { action })
          .then(resolve)
          .catch(() => resolve(null));
      });
    });
  } catch {
    return null;
  }
}

export function isRecaptchaEnabled(): boolean {
  return Boolean(SITE_KEY);
}
