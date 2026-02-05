import type { ReactNode } from 'react';
import BasePanel from './BasePanel';

interface StudioPanelProps {
    title: string;
    children: ReactNode;
}

/**
 * Right panel (tools): BasePanel with header + tool grid below.
 * Two-column grid; card height 48–56px; H gap 12–16px, V gap 14–16px.
 * Icon + label only. No output preview area, empty-state text, add-note button, floating actions, decorative separators.
 */
export default function StudioPanel({ title, children }: StudioPanelProps) {
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
                className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col"
                style={{
                    gap: 'var(--stack-gap)',
                    paddingTop: 'var(--rhythm)',
                }}
            >
                {children}
            </div>
        </BasePanel>
    );
}
