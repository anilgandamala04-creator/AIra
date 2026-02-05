import type { ReactNode } from 'react';

interface BasePanelProps {
    children: ReactNode;
    className?: string;
}

/**
 * Reusable panel: internal padding 16–20px, corner radius 16–18px,
 * soft shadow, column layout. No decorative boxes, placeholder illustrations,
 * instructional/empty-state text, or hard borders.
 */
export default function BasePanel({ children, className = '' }: BasePanelProps) {
    return (
        <div
            className={`min-w-0 min-h-0 flex flex-col overflow-hidden bg-white dark:bg-slate-800/95 ${className}`}
            style={{
                padding: 'var(--panel-padding)',
                borderRadius: 'var(--panel-radius)',
                boxShadow: '0 2px 12px -2px rgba(0,0,0,0.06), 0 4px 16px -4px rgba(0,0,0,0.04)',
            }}
        >
            {children}
        </div>
    );
}
