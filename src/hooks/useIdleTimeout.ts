/**
 * Idle / session timeout: after a period of no activity, show a warning then sign the user out.
 * For shared devices and security. Configurable idle minutes and warning countdown.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';

const DEFAULT_IDLE_MINUTES = 45;
const WARNING_BEFORE_LOGOUT_SECONDS = 60;
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'] as const;

export interface IdleTimeoutOptions {
  /** Minutes of inactivity before showing warning. Default 45. */
  idleMinutes?: number;
  /** Seconds to show "Stay signed in?" before auto-logout. Default 60. */
  warningSeconds?: number;
  /** If false, hook does nothing (e.g. when not authenticated). */
  enabled?: boolean;
}

export function useIdleTimeout(options: IdleTimeoutOptions = {}) {
  const {
    idleMinutes = DEFAULT_IDLE_MINUTES,
    warningSeconds = WARNING_BEFORE_LOGOUT_SECONDS,
    enabled = true,
  } = options;

  const logout = useAuthStore((s) => s.logout);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isGuest = useAuthStore((s) => s.isGuest);

  const active = enabled && isAuthenticated && !isGuest;

  const lastActivityRef = useRef<number>(Date.now());
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onShowWarningRef = useRef<((secondsLeft: number) => void) | null>(null);
  const onHideWarningRef = useRef<(() => void) | null>(null);

  const clearTimers = useCallback(() => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    onHideWarningRef.current?.();
  }, []);

  const scheduleWarning = useCallback(() => {
    clearTimers();
    const idleMs = idleMinutes * 60 * 1000;
    warningTimerRef.current = setTimeout(() => {
      warningTimerRef.current = null;
      let secondsLeft = warningSeconds;
      onShowWarningRef.current?.(secondsLeft);

      const tick = () => {
        secondsLeft -= 1;
        onShowWarningRef.current?.(secondsLeft);
        if (secondsLeft <= 0) {
          logoutTimerRef.current = null;
          onHideWarningRef.current?.();
          logout();
          return;
        }
        logoutTimerRef.current = setTimeout(tick, 1000);
      };
      logoutTimerRef.current = setTimeout(tick, 1000);
    }, idleMs);
  }, [idleMinutes, warningSeconds, clearTimers, logout]);

  const handleActivity = useCallback(() => {
    if (!active) return;
    lastActivityRef.current = Date.now();
    scheduleWarning();
  }, [active, scheduleWarning]);

  useEffect(() => {
    if (!active) {
      clearTimers();
      return;
    }
    scheduleWarning();
    ACTIVITY_EVENTS.forEach((ev) => window.addEventListener(ev, handleActivity));
    return () => {
      ACTIVITY_EVENTS.forEach((ev) => window.removeEventListener(ev, handleActivity));
      clearTimers();
    };
  }, [active, handleActivity, scheduleWarning, clearTimers]);

  return {
    setWarningCallbacks: (show: (secondsLeft: number) => void, hide: () => void) => {
      onShowWarningRef.current = show;
      onHideWarningRef.current = hide;
    },
    staySignedIn: () => {
      clearTimers();
      lastActivityRef.current = Date.now();
      scheduleWarning();
    },
  };
}
