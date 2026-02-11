import { useSettingsStore } from '../../stores/settingsStore';
import { useShallow } from 'zustand/react/shallow';

interface SkeletonProps {
  className?: string;
  /** Optional number of lines (for text blocks) */
  lines?: number;
}

export function Skeleton({ className = '', lines }: SkeletonProps) {
  const reduceAnimations = useSettingsStore(useShallow((s) => s.settings.accessibility.reduceAnimations));

  const baseClass = reduceAnimations
    ? 'bg-gray-200 dark:bg-slate-700 rounded'
    : 'animate-pulse bg-gray-200 dark:bg-slate-700 rounded';

  if (lines != null && lines > 0) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className={`${baseClass} ${i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}`}
            style={{ height: '1rem' }}
          />
        ))}
      </div>
    );
  }

  return <div className={`${baseClass} ${className}`} />;
}

/** Skeleton for a list item (e.g. topic row) */
export function SkeletonListItem({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl ${className ?? ''}`}>
      <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

/** Skeleton for dashboard stat cards */
export function SkeletonStatCard({ className }: { className?: string }) {
  return (
    <div className={`p-4 rounded-xl border border-gray-200 dark:border-slate-700 ${className ?? ''}`}>
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-8 w-16" />
    </div>
  );
}
