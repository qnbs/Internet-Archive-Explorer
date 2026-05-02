import { afterEach, describe, expect, it, vi } from 'vitest';
import { delay, fetchWithRetry } from '@/utils/fetchWithRetry';

describe('delay', () => {
  it('resolves after the given milliseconds', async () => {
    const start = Date.now();
    await delay(25);
    expect(Date.now() - start).toBeGreaterThanOrEqual(20);
  });
});

describe('fetchWithRetry', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns immediately on 200', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('ok', { status: 200 }));
    const res = await fetchWithRetry('https://example.com', {}, 2, 10, 30_000);
    expect(res.ok).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('retries once on HTTP 500 then succeeds', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response('fail', { status: 500 }))
      .mockResolvedValueOnce(new Response('ok', { status: 200 }));

    const res = await fetchWithRetry('https://example.com', {}, 2, 20, 30_000);

    expect(res.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('retries on transient network failure', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(new TypeError('network'))
      .mockResolvedValueOnce(new Response('ok', { status: 200 }));

    const res = await fetchWithRetry('https://example.com', {}, 2, 20, 30_000);

    expect(res.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
