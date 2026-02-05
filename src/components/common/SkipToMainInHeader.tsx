import { MAIN_CONTENT_ID } from '../../constants/layout';

/**
 * "Skip to main content" link/button for the header. First focusable in header;
 * when activated, focus moves to #main-content. Visually hidden until focused (or always visible as a small link).
 */
export default function SkipToMainInHeader() {
  return (
    <a
      href={`#${MAIN_CONTENT_ID}`}
      className="sr-only focus:static focus:inline-flex focus:items-center focus:justify-center focus:py-2 focus:px-4 focus:min-h-[44px] focus:min-w-[44px] focus:mr-2 focus:m-0 focus:overflow-visible focus:whitespace-normal focus:rounded-lg focus:bg-purple-600 focus:text-white focus:text-sm focus:font-medium focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 dark:focus:bg-purple-500 dark:focus:ring-purple-300 focus:[clip:auto]"
    >
      Skip to main content
    </a>
  );
}
