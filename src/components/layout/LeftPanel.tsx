import type { ReactNode } from 'react';
import BasePanel from './BasePanel';

interface LeftPanelProps {
    title: string;
    children: ReactNode;
}

/**
 * Left panel (Chat/Sources): BasePanel with text-only header.
 * Header 44–48px; vertical spacing 14–16px; input/button height 40–44px.
 * No highlight banners, empty-state messaging, decorative icons, or helper text blocks.
 */
export default function LeftPanel({ title, children }: LeftPanelProps) {
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
                className="flex-1 min-h-0 flex flex-col overflow-hidden"
                style={{ gap: 'var(--stack-gap)' }}
            >
                {children}
            </div>
        </BasePanel>
    );
}
