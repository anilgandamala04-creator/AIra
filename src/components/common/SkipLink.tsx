import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { MAIN_CONTENT_ID } from '../../constants/layout';

/**
 * Skip link for keyboard/screen reader users. Visible only on focus.
 * Jumps to #main-content so users can bypass repeated navigation.
 */
export default function SkipLink() {
  const location = useLocation();
  const linkRef = useRef<HTMLAnchorElement>(null);

  // After route change, ensure focus isn't stuck on the skip link; main content will receive focus when it mounts with tabIndex={-1} and useFocusMain.
  useEffect(() => {
    linkRef.current?.blur();
  }, [location.pathname]);

  return (
    <a
      ref={linkRef}
      href={`#${MAIN_CONTENT_ID}`}
      className="fixed left-4 top-4 z-[200] -translate-y-[120%] rounded-lg bg-purple-600 px-4 py-3 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-sm font-medium text-white shadow-lg transition-transform duration-200 focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 dark:bg-purple-500 dark:focus:ring-purple-300 touch-manipulation"
      style={{ position: 'fixed' }}
    >
      Skip to main content
    </a>
  );
}
