import { useEffect, useRef } from 'react';

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Traps focus inside the given element while active (e.g. modal or full-screen panel).
 * On activate: store the previously focused element and optionally focus the first focusable inside.
 * On Tab: cycle within the element (last -> first, first -> last).
 * On deactivate: restore focus to the previously focused element.
 * @param active - when true, trap is active; when false, effect no-ops and restores focus on cleanup
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement | null>,
  options?: { initialFocus?: boolean; active?: boolean }
) {
  const previousActive = useRef<HTMLElement | null>(null);
  const active = options?.active !== false;

  useEffect(() => {
    if (!active) return;
    const el = containerRef.current;
    if (!el) return;

    previousActive.current = document.activeElement as HTMLElement | null;

    const focusables = el.querySelectorAll<HTMLElement>(FOCUSABLE);
    const first = focusables[0] ?? null;

    if (options?.initialFocus !== false && first) {
      try {
        first.focus();
      } catch {
        // ignore
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const current = document.activeElement as HTMLElement | null;
      if (!el.contains(current)) return;

      const list = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (list.length === 0) return;
      if (!current) return;

      const idx = list.indexOf(current);
      const lastEl = list[list.length - 1];
      if (e.shiftKey) {
        if (idx <= 0 && lastEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (idx === -1 || idx >= list.length - 1) {
          e.preventDefault();
          const firstEl = list[0];
          if (firstEl) firstEl.focus();
        }
      }
    };

    el.addEventListener('keydown', handleKeyDown);
    return () => {
      el.removeEventListener('keydown', handleKeyDown);
      try {
        previousActive.current?.focus();
      } catch {
        // ignore
      }
      previousActive.current = null;
    };
  }, [active, containerRef, options?.initialFocus]);
}
