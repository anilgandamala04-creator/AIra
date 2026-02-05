import type { ReactNode } from 'react';
import GlobalHeader from './GlobalHeader';
import ThreePanelLayout from './ThreePanelLayout';

interface AppShellProps {
    leftPanel: ReactNode;
    centerPanel: ReactNode;
    rightPanel: ReactNode;
    /** Optional footer below panels (e.g. disclaimer) */
    footer?: ReactNode;
}

/**
 * Root shell: global header + three-panel layout.
 * Page padding 24–32px, gap 20–24px, flex horizontal, no horizontal overflow.
 */
export default function AppShell({ leftPanel, centerPanel, rightPanel, footer }: AppShellProps) {
    return (
        <div className="fixed inset-0 h-[100dvh] w-full max-w-[100vw] flex flex-col overflow-hidden overflow-x-hidden">
            {/* Soft gradient background - static behind panels */}
            <div
                className="fixed inset-0 -z-10 bg-gradient-to-b from-[#e8e4f3] via-[#f5f0fa] to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-800"
                aria-hidden
            />
            <div
                className="fixed inset-0 -z-10 pointer-events-none shadow-[inset_0_0_120px_40px_rgba(139,92,246,0.04)] dark:shadow-[inset_0_0_120px_40px_rgba(0,0,0,0.2)]"
                aria-hidden
            />

            <GlobalHeader />

            <ThreePanelLayout left={leftPanel} center={centerPanel} right={rightPanel} />

            {footer != null && (
                <footer className="shrink-0 py-2 flex justify-center" aria-label="Disclaimer">
                    {footer}
                </footer>
            )}
        </div>
    );
}
