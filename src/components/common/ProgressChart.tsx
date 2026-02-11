/**
 * Simple progress-over-time chart: study time per week or quiz score trend.
 * Uses CSS/SVG only - no chart library.
 */

import { useMemo } from 'react';

interface SessionData {
  date?: string;
  durationMinutes?: number;
  quizScore?: number;
  topicId?: string;
}

interface ProgressChartProps {
  sessions: SessionData[];
  type: 'studyTime' | 'quizScore';
  weeks?: number;
  className?: string;
}

export default function ProgressChart({ sessions, type, weeks = 8, className = '' }: ProgressChartProps) {
  const { values } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekMs = 7 * 24 * 60 * 60 * 1000;

    const result: { label: string; value: number }[] = [];
    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = new Date(today.getTime() - (i + 1) * weekMs);
      const weekEnd = new Date(today.getTime() - i * weekMs);
      const label = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;

      if (type === 'studyTime') {
        const minutes = sessions
          .filter((s) => {
            const d = s.date?.slice(0, 10);
            if (!d) return false;
            const date = new Date(d);
            return date >= weekStart && date < weekEnd;
          })
          .reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0);
        result.push({ label, value: minutes });
      } else {
        const scores = sessions
          .filter((s) => {
            const d = s.date?.slice(0, 10);
            if (!d || s.quizScore == null) return false;
            const date = new Date(d);
            return date >= weekStart && date < weekEnd;
          })
          .map((s) => s.quizScore!);
        const avg = scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0;
        result.push({ label, value: avg });
      }
    }
    return { values: result };
  }, [sessions, type, weeks]);

  const maxVal = Math.max(1, ...values.map((v) => v.value));

  return (
    <div className={`${className}`}>
      <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
        {type === 'studyTime' ? 'Study time per week' : 'Quiz score trend'}
      </h4>
      <div className="flex items-end gap-1 h-24">
        {values.map((v, i) => (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-0.5 min-w-0"
            title={`${v.label}: ${type === 'studyTime' ? v.value + ' min' : v.value + '%'}`}
          >
            <div
              className="w-full bg-purple-500 dark:bg-purple-600 rounded-t transition-all min-h-[4px]"
              style={{ height: `${Math.max(4, (v.value / maxVal) * 80)}%` }}
            />
            <span className="text-[10px] text-gray-500 dark:text-slate-400 truncate w-full text-center">
              {v.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
