import { describe, expect, it } from 'vitest';
import { mergeSwCacheExposeHeaders, SW_CACHE_TIME_HEADER } from '@/utils/swCacheHeaders';

describe('swCacheHeaders', () => {
  it('adds X-SW-Cache-Time to Access-Control-Expose-Headers', () => {
    const headers = mergeSwCacheExposeHeaders(new Headers());
    expect(headers.get('Access-Control-Expose-Headers')).toContain(SW_CACHE_TIME_HEADER);
  });

  it('preserves existing exposed headers', () => {
    const source = new Headers({ 'Access-Control-Expose-Headers': 'Content-Length' });
    const headers = mergeSwCacheExposeHeaders(source);
    const exposed = headers.get('Access-Control-Expose-Headers') ?? '';
    expect(exposed).toContain('Content-Length');
    expect(exposed).toContain(SW_CACHE_TIME_HEADER);
  });
});
