/**
 * Date and number formatting by user locale (language).
 * Use with settings.language so "last studied", scores, and durations match the user's language.
 */

function defaultLocale(): string {
  return typeof navigator !== 'undefined' ? navigator.language : 'en';
}

/**
 * Format a date for display (e.g. "last studied", activity calendar).
 * Uses Intl.DateTimeFormat with the user's language.
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
  lang?: string
): string {
  const d = typeof date === 'object' && date instanceof Date ? date : new Date(date);
  const l = lang ?? defaultLocale();
  return new Intl.DateTimeFormat(l, options).format(d);
}

/**
 * Format a number (scores, durations, counts).
 */
export function formatNumber(value: number, options?: Intl.NumberFormatOptions, lang?: string): string {
  const l = lang ?? defaultLocale();
  return new Intl.NumberFormat(l, options).format(value);
}

/**
 * Format a relative time (e.g. "2 hours ago", "yesterday").
 */
export function formatRelativeTime(
  date: Date | string | number,
  base: Date = new Date(),
  lang?: string
): string {
  const d = typeof date === 'object' && date instanceof Date ? date : new Date(date);
  const l = lang ?? defaultLocale();
  const diffMs = d.getTime() - base.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  const rtf = new Intl.RelativeTimeFormat(l, { numeric: 'auto' });
  if (Math.abs(diffSec) < 60) return rtf.format(diffSec, 'second');
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');
  if (Math.abs(diffHour) < 24) return rtf.format(diffHour, 'hour');
  if (Math.abs(diffDay) < 7) return rtf.format(diffDay, 'day');
  return formatDate(d, { dateStyle: 'short' }, l);
}
