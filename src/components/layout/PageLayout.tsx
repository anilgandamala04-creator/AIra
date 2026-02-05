import { ReactNode } from 'react';
import { PAGE_MAX_WIDTH, PAGE_PX, MAIN_CONTENT_ID } from '../../constants/layout';

interface PageLayoutProps {
  children: ReactNode;
  /** Optional: use narrower max-width (e.g. settings). */
  narrow?: boolean;
  /** Optional: additional class for the main element. */
  className?: string;
  /** Optional: id for main (default: main-content for skip link). */
  mainId?: string;
}

/**
 * Consistent page wrapper: max-width, horizontal padding, main landmark with id for skip link.
 * Use for dashboard, curriculum, settings, and other secondary pages.
 */
export default function PageLayout({
  children,
  narrow = false,
  className = '',
  mainId = MAIN_CONTENT_ID,
}: PageLayoutProps) {
  return (
    <main
      id={mainId}
      tabIndex={-1}
      className={`mx-auto w-full ${narrow ? 'max-w-5xl' : PAGE_MAX_WIDTH} ${PAGE_PX} ${className}`}
    >
      {children}
    </main>
  );
}
