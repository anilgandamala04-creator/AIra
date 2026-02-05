/**
 * Design system constants for consistent layout, breakpoints, and accessibility.
 * Aligns with Tailwind default breakpoints and WCAG touch target recommendations.
 */

/** Minimum touch target size (WCAG 2.5.5). Used for buttons and interactive elements on touch devices. */
export const TOUCH_TARGET_MIN = 44;

/** Tailwind-aligned breakpoints (px). Use for JS media queries or layout logic. */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/** Verification viewport ranges: Desktop ≥1280, Laptop 1024–1279, Tablet 768–1023, Mobile ≤767. */
export const VIEWPORT_DESKTOP_MIN = 1280;
export const VIEWPORT_LAPTOP_MIN = 1024;
export const VIEWPORT_TABLET_MIN = 768;
export const VIEWPORT_MOBILE_MAX = 767;

/** Max width for primary content (dashboard, curriculum, settings). */
export const PAGE_MAX_WIDTH = 'max-w-7xl';

/** Max width for narrow content (settings form, modals). */
export const CONTENT_MAX_WIDTH_NARROW = 'max-w-5xl';

/** Consistent horizontal padding for page content (Tailwind values). */
export const PAGE_PX = 'px-3 sm:px-4 md:px-6 lg:px-8';

/** Safe area class names for notched devices (notches, orientation). */
export const SAFE_AREAS = 'safe-top safe-bottom';

/** ID for main content landmark (used by SkipLink and focus management). */
export const MAIN_CONTENT_ID = 'main-content';

/**
 * Responsive design: use flexible grids (grid-cols-1 sm:grid-cols-2 lg:grid-cols-3),
 * fluid spacing (PAGE_PX, gap-responsive), and TOUCH_TARGET_MIN (44px) for interactive
 * elements on mobile. Support touch (touch-manipulation, min-h-[44px]), keyboard
 * (focus-visible:ring-2), and pointer. Prevent clipping with min-w-0 on flex children
 * and overflow-x-hidden on scroll containers.
 */
