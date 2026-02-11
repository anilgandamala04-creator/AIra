/**
 * GitHub-style activity calendar: study days or minutes per day.
 * Shows last N weeks (e.g. 12) with 7 columns (days); color intensity by activity level.
 */

import { useMemo } from 'react';

export interface DayActivity {
  date: string; // YYYY-MM-DD
  minutes: number;
}

interface ActivityCalendarProps {
  /** List of sessions with date and duration (e.g. from analytics) */
  sessions: { date: string; durationMinutes: number }[];
  /** Number of weeks to show (default 12) */
  weeks?: number;
  className?: string;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ActivityCalendar({ sessions, weeks = 12, className = '' }: ActivityCalendarProps) {
  const { grid, maxMinutes } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayMs = 24 * 60 * 60 * 1000;
    const totalDays = weeks * 7;
    const startDate = new Date(today.getTime() - (totalDays - 1) * dayMs);

    const byDate = new Map<string, number>();
    sessions.forEach((s) => {
      const d = s.date.slice(0, 10);
      const min = (byDate.get(d) ?? 0) + (s.durationMinutes ?? 0);
      byDate.set(d, min);
    });

    let maxMinutes = 1;
    byDate.forEach((m) => { if (m > maxMinutes) maxMinutes = m; });

    // grid[dayOfWeek][weekIndex] = minutes; 7 rows (Sun–Sat), weeks columns
    const grid: (number | null)[][] = [];
    for (let d = 0; d < 7; d++) {
      const row: (number | null)[] = [];
      for (let w = 0; w < weeks; w++) {
        const date = new Date(startDate.getTime() + (w * 7 + d) * dayMs);
        if (date > today) {
          row.push(null);
          continue;
        }
        const key = date.toISOString().slice(0, 10);
        row.push(byDate.get(key) ?? 0);
      }
      grid.push(row);
    }
    return { grid, maxMinutes };
  }, [sessions, weeks]);

  const getLevel = (minutes: number): number => {
    if (minutes <= 0) return 0;
    if (maxMinutes <= 0) return 0;
    const ratio = minutes / maxMinutes;
    if (ratio <= 0.25) return 1;
    if (ratio <= 0.5) return 2;
    if (ratio <= 0.75) return 3;
    return 4;
  };

  return (
    <div className={`${className}`}>
      <div className="flex gap-1 items-start">
        <div className="flex flex-col gap-0.5 text-xs text-gray-500 dark:text-slate-400 pt-2 pr-1">
          {DAY_LABELS.map((label) => (
            <span key={label} className="h-3 flex items-center">
              {label}
            </span>
          ))}
        </div>
        <div className="flex gap-0.5 overflow-x-auto">
          {Array.from({ length: weeks }, (_, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {grid.map((row, di) => {
                const minutes = row[wi];
                if (minutes === null) {
                  return <div key={di} className="w-3 h-3 rounded-sm bg-transparent" aria-hidden />;
                }
                const level = getLevel(minutes);
                return (
                  <div
                    key={`${wi}-${di}`}
                    className="w-3 h-3 rounded-sm transition-colors"
                    style={{
                      backgroundColor:
                        level === 0
                          ? 'var(--color-grid-empty, #ebedf0)'
                          : level === 1
                            ? 'rgba(139, 125, 214, 0.35)'
                            : level === 2
                              ? 'rgba(139, 125, 214, 0.6)'
                              : level === 3
                                ? 'rgba(139, 125, 214, 0.85)'
                                : 'rgb(139, 125, 214)',
                    }}
                    title={minutes > 0 ? `${minutes} min` : 'No activity'}
                    aria-hidden
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-slate-400">
        <span>Less</span>
        <div className="flex gap-0.5">
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className="w-3 h-3 rounded-sm"
              style={{
                backgroundColor:
                  level === 0
                    ? 'var(--color-grid-empty, #ebedf0)'
                    : level === 1
                      ? 'rgba(139, 125, 214, 0.35)'
                      : level === 2
                        ? 'rgba(139, 125, 214, 0.6)'
                        : level === 3
                          ? 'rgba(139, 125, 214, 0.85)'
                          : 'rgb(139, 125, 214)',
              }}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
