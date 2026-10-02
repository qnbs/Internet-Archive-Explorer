import { describe, expect, it } from 'vitest';
import { stripOAuthParamsFromSearch } from '@/utils/oauthUrl';

describe('stripOAuthParamsFromSearch', () => {
  it('removes OAuth params but keeps app deep-link params', () => {
    const cleaned = stripOAuthParamsFromSearch(
      '?code=abc&state=xyz&modal=itemDetail&id=foo&scope=email',
    );
    expect(cleaned).toBe('?modal=itemDetail&id=foo');
  });

  it('returns empty string when only OAuth params were present', () => {
    expect(stripOAuthParamsFromSearch('?code=1&state=2')).toBe('');
  });
});
