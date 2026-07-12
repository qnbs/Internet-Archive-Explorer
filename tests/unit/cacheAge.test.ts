import { describe, expect, it } from 'vitest';
import { formatCacheAge } from '@/utils/cacheAge';

describe('formatCacheAge', () => {
  it('formats seconds', () => {
    const age = formatCacheAge(Date.now() - 30_000, 'en');
    expect(age).toMatch(/30s ago|30 sec/);
  });

  it('formats minutes', () => {
    const age = formatCacheAge(Date.now() - 5 * 60_000, 'en');
    expect(age).toMatch(/5m ago|5 min/);
  });

  it('formats hours', () => {
    const age = formatCacheAge(Date.now() - 3 * 60 * 60_000, 'en');
    expect(age).toMatch(/3h ago|3 hr/);
  });

  it('formats days', () => {
    const age = formatCacheAge(Date.now() - 2 * 24 * 60 * 60_000, 'en');
    expect(age).toMatch(/2d ago|2 days/);
  });

  it('supports German locale', () => {
    const age = formatCacheAge(Date.now() - 60_000, 'de');
    expect(age).toContain('vor');
  });
});
