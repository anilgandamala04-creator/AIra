import type { ReactNode } from 'react';

interface ThreePanelLayoutProps {
    left: ReactNode;
    center: ReactNode;
    right: ReactNode;
}

/**
 * Three-column layout on xl (≥1280px): Left 20–22%, Center 56–60%, Right 18–20%.
 * Below 1280px: single column stack, full width, no horizontal overflow; panels share height.
 * Panels share same top/bottom alignment and stretch to available height.
 */
export default function ThreePanelLayout({ left, center, right }: ThreePanelLayoutProps) {
    return (
        <div
            className="flex-1 flex min-h-0 min-w-0 max-w-full overflow-hidden overflow-x-hidden xl:flex-row flex-col"
            style={{
                paddingLeft: 'var(--layout-page-px)',
                paddingRight: 'var(--layout-page-px)',
                gap: 'var(--layout-gap)',
            }}
        >
            <div
                className="flex-shrink-0 flex-grow-0 min-h-0 flex flex-col w-full xl:w-[var(--panel-chat-width)] min-w-0"
            >
                {left}
            </div>
            <div
                className="flex-shrink-0 flex-grow-0 min-h-0 flex flex-col w-full xl:w-[var(--panel-teaching-width)] min-w-0"
            >
                {center}
            </div>
            <div
                className="flex-shrink-0 flex-grow-0 min-h-0 flex flex-col w-full xl:w-[var(--panel-studio-width)] min-w-0"
            >
                {right}
            </div>
        </div>
    );
}
