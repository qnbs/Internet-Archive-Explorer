import { describe, expect, it } from 'vitest';
import { sanitizeHtml } from '@/utils/sanitizer';

describe('sanitizeHtml', () => {
  it('returns empty string for non-string input', () => {
    expect(sanitizeHtml(undefined as unknown as string)).toBe('');
  });

  it('strips script tags and dangerous markup', () => {
    const dirty = '<p>Hello</p><script>alert(1)</script><iframe src="x"></iframe>';
    const clean = sanitizeHtml(dirty);
    expect(clean).toContain('Hello');
    expect(clean.toLowerCase()).not.toContain('<script');
    expect(clean.toLowerCase()).not.toContain('<iframe');
  });

  it('allows benign HTML', () => {
    expect(sanitizeHtml('<strong>OK</strong>')).toContain('strong');
  });
});
