/**
 * Minimal error reporting (no PII) for debugging and stability.
 * Only sends when user has consented (privacy.errorReportingEnabled).
 */

import { APP_VERSION } from '../constants/app';
import { useSettingsStore } from '../stores/settingsStore';

const ENDPOINT = typeof import.meta.env?.VITE_ERROR_REPORTING_URL === 'string'
  ? import.meta.env.VITE_ERROR_REPORTING_URL
  : '';

export interface ErrorReportPayload {
  message: string;
  name: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  version: string;
  url: string; // pathname only, no query/hash to avoid tokens
}

function getConsent(): boolean {
  try {
    return useSettingsStore.getState().settings.privacy?.errorReportingEnabled === true;
  } catch {
    return false;
  }
}

function buildPayload(error: Error, componentStack?: string): ErrorReportPayload {
  const stack = error.stack?.slice(0, 2000); // truncate to avoid huge payloads
  return {
    message: error.message?.slice(0, 500) ?? 'Unknown error',
    name: error.name ?? 'Error',
    stack,
    componentStack: componentStack?.slice(0, 1000),
    timestamp: new Date().toISOString(),
    version: APP_VERSION,
    url: typeof window !== 'undefined' ? (window.location.pathname ?? '') : '',
  };
}

/**
 * Report an error to the backend (or no-op if no endpoint or no consent).
 * Call from ErrorBoundary and optionally from failed API calls.
 */
export function reportError(error: Error, errorInfo?: { componentStack?: string }): void {
  if (!getConsent()) return;
  if (!ENDPOINT) return;

  const payload = buildPayload(error, errorInfo?.componentStack);

  try {
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true, // allow send on page unload
    }).catch(() => { /* ignore */ });
  } catch {
    // ignore
  }
}

/**
 * Report an uncaught error (e.g. from window.onerror).
 * Only reports if consent given and endpoint configured.
 */
export function initGlobalErrorHandler(): () => void {
  const handler = (event: ErrorEvent) => {
    if (event.error && getConsent() && ENDPOINT) {
      const payload = buildPayload(event.error);
      try {
        fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {});
      } catch {
        // ignore
      }
    }
  };
  window.addEventListener('error', handler);
  return () => window.removeEventListener('error', handler);
}
