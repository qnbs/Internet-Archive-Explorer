import type { Language } from '@/types';

/**
 * Format a cache timestamp as a human-readable relative age.
 */
export function formatCacheAge(cacheTimeMs: number, language: Language): string {
  const diff = Date.now() - cacheTimeMs;
  const seconds = Math.floor(diff / 1000);
  const rtf = new Intl.RelativeTimeFormat(language, { numeric: 'auto', style: 'narrow' });

  if (seconds < 60) {
    return rtf.format(-seconds, 'second');
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return rtf.format(-minutes, 'minute');
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return rtf.format(-hours, 'hour');
  }
  const days = Math.floor(hours / 24);
  return rtf.format(-days, 'day');
}
