/**
 * Firebase Analytics: log key events when enabled in settings.
 * Analytics is initialized in firebase.ts; this module only logs events.
 * Requires cookie consent before enabling analytics.
 */
import { logEvent } from 'firebase/analytics';
import { analytics } from './firebase';
import { useSettingsStore } from '../stores/settingsStore';
import { useConsentStore } from '../stores/consentStore';

function isAnalyticsEnabled(): boolean {
  try {
    const consent = useConsentStore.getState();
    if (!consent.hasConsented) return false;
    return useSettingsStore.getState().settings?.privacy?.analyticsEnabled !== false;
  } catch {
    return false;
  }
}

/**
 * Log an event to Firebase Analytics if Analytics is available and user has not disabled it.
 */
export function logAppEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
): void {
  if (typeof window === 'undefined' || !analytics || !isAnalyticsEnabled()) return;
  try {
    logEvent(analytics, eventName, params);
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn('[Analytics]', eventName, e);
    }
  }
}

/** Predefined event names for consistency */
export const ANALYTICS_EVENTS = {
  LOGIN: 'login',
  LESSON_START: 'lesson_start',
  DOUBT_RAISED: 'doubt_raised',
  DOUBT_RESOLVED: 'doubt_resolved',
  NOTE_GENERATED: 'note_generated',
  QUIZ_GENERATED: 'quiz_generated',
  MIND_MAP_GENERATED: 'mind_map_generated',
  FLASHCARD_GENERATED: 'flashcard_generated',
  SETTINGS_CHANGED: 'settings_changed',
  PWA_INSTALLED: 'pwa_installed',
  APP_ERROR: 'app_error',
} as const;

/**
 * Log an error to Analytics
 */
export function logAppError(error: Error | string, fatal = false, context?: string): void {
  const message = typeof error === 'string' ? error : error.message;
  if (import.meta.env.DEV) {
    console.error(`[App Error] ${context ? `[${context}] ` : ''}${message}`, error);
  }

  const eventParams: Record<string, string | number | boolean> = {
    message: message.slice(0, 100),
    fatal,
    context: context || 'unknown',
  };

  if (error instanceof Error && error.stack) {
    eventParams.stack = error.stack.slice(0, 200);
  }

  logAppEvent(ANALYTICS_EVENTS.APP_ERROR, eventParams);
}
