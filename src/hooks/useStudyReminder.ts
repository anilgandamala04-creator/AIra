/**
 * Study reminders: at reminderTime (from settings), or per-day reminderSchedule.
 * Shows browser notification when studyReminders is enabled.
 */
import { useEffect, useRef } from 'react';
import { useSettingsStore } from '../stores/settingsStore';

const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

function shouldNotify(
  now: Date,
  reminderTime: string,
  lastFired: React.MutableRefObject<string>,
  reminderSchedule?: Record<string, string>
): boolean {
  const dayKey = DAYS[now.getDay()];
  const timeStr = reminderSchedule?.[dayKey] ?? reminderTime;
  const [h, m] = timeStr.split(':').map(Number);
  const key = `${now.getDate()}-${now.getMonth()}-${now.getFullYear()}-${h}-${m}`;
  if (lastFired.current === key) return false;
  if (now.getHours() !== h || now.getMinutes() !== m) return false;
  lastFired.current = key;
  return true;
}

export function useStudyReminder(): void {
  const reminderTime = useSettingsStore((s) => s.settings.notifications.reminderTime);
  const reminderSchedule = useSettingsStore((s) => s.settings.notifications.reminderSchedule);
  const studyReminders = useSettingsStore((s) => s.settings.notifications.studyReminders);
  const lastFired = useRef<string>('');

  useEffect(() => {
    if (!studyReminders || typeof window === 'undefined' || !('Notification' in window)) return;

    const checkAndNotify = () => {
      const now = new Date();
      if (!shouldNotify(now, reminderTime, lastFired, reminderSchedule)) return;

      if (Notification.permission === 'granted') {
        new Notification('AIra – Time to study!', {
          body: 'Your study reminder. Open AIra to continue learning.',
          icon: '/favicon.ico',
        });
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then((p) => {
          if (p === 'granted') {
            new Notification('AIra – Time to study!', {
              body: 'Your study reminder. Open AIra to continue learning.',
              icon: '/favicon.ico',
            });
          }
        });
      }
    };

    checkAndNotify();
    const interval = setInterval(checkAndNotify, 60 * 1000);
    return () => clearInterval(interval);
  }, [reminderTime, reminderSchedule, studyReminders]);
}
