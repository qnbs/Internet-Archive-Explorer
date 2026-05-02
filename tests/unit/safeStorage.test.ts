import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/utils/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
  },
}));

import { safeJotaiSyncStorage } from '@/store/safeStorage';

describe('safeJotaiSyncStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns initial value when key is missing', () => {
    expect(safeJotaiSyncStorage.getItem('missing', { n: 1 })).toEqual({ n: 1 });
  });

  it('parses valid JSON from localStorage', () => {
    localStorage.setItem('k', JSON.stringify({ ok: true }));
    expect(safeJotaiSyncStorage.getItem('k', null)).toEqual({ ok: true });
  });

  it('removes corrupted entries and falls back to initial value', () => {
    localStorage.setItem('bad', 'not-json{{{');
    expect(safeJotaiSyncStorage.getItem('bad', 'fallback')).toBe('fallback');
    expect(localStorage.getItem('bad')).toBeNull();
  });

  it('persists JSON via setItem', () => {
    safeJotaiSyncStorage.setItem('x', [1, 2]);
    expect(localStorage.getItem('x')).toBe(JSON.stringify([1, 2]));
  });

  it('removeItem clears the key', () => {
    localStorage.setItem('z', '"1"');
    safeJotaiSyncStorage.removeItem('z');
    expect(localStorage.getItem('z')).toBeNull();
  });
});
