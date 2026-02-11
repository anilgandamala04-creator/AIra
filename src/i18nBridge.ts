/**
 * Bridge for i18n readiness - allows main.tsx to preload i18n in parallel with App
 * and mark it ready before first render, eliminating the sequential loading delay.
 */
export let changeLanguageFn: (lng: string) => void = () => {};
export let i18nPreloaded = false;
const readyListeners: Array<() => void> = [];

export function setI18nReady(fn: (lng: string) => void): void {
  changeLanguageFn = fn;
  i18nPreloaded = true;
  readyListeners.splice(0).forEach((cb) => cb());
}

/** Call callback when i18n is ready (immediately if already ready). Use so App can show content without blocking on i18n load. */
export function whenI18nReady(cb: () => void): void {
  if (i18nPreloaded) {
    cb();
    return;
  }
  readyListeners.push(cb);
}
