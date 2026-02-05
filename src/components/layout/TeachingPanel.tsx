import type { ReactNode } from 'react';
import BasePanel from './BasePanel';

interface TeachingPanelProps {
    title: string;
    children: ReactNode;
}

/**
 * Center panel (primary workspace): Header + TeachingBoard.
 * TeachingBoard occupies 85–90% of panel height; single continuous content surface.
 * No frames, cards, or nested containers; content rendered directly on the surface.
 */
export default function TeachingPanel({ title, children }: TeachingPanelProps) {
    return (
        <BasePanel className="flex flex-col">
            <div
                className="shrink-0 flex items-center justify-center min-w-0"
                style={{
                    minHeight: 46,
                    marginBottom: 'var(--panel-header-gap)',
                }}
            >
                <span className="font-medium text-gray-700 dark:text-slate-200 text-[15px] truncate">
                    {title}
                </span>
            </div>
            <div
                className="flex-1 min-h-0 flex flex-col overflow-hidden rounded-[15px] bg-[#F5F6F7] dark:bg-slate-800/60 p-4"
                style={{ minHeight: '85%' }}
            >
                {children}
            </div>
        </BasePanel>
    );
}
