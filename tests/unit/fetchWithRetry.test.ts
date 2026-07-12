import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyJitter, delay, fetchWithRetry } from '@/utils/fetchWithRetry';

describe('delay', () => {
  it('resolves after the given milliseconds', async () => {
    const start = Date.now();
    await delay(25);
    expect(Date.now() - start).toBeGreaterThanOrEqual(20);
  });
});

describe('applyJitter', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns baseMs when jitterFactor is 0', () => {
    expect(applyJitter(1000, 0)).toBe(1000);
  });

  it('returns baseMs when jitterFactor is negative', () => {
    expect(applyJitter(1000, -0.5)).toBe(1000);
  });

  it('adds positive jitter when Math.random is high', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.8);
    expect(applyJitter(1000, 0.3)).toBe(1180);
  });

  it('subtracts jitter when Math.random is low', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.2);
    expect(applyJitter(1000, 0.3)).toBe(820);
  });

  it('floors the result to an integer', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    expect(applyJitter(1000, 0.3)).toBe(1000);
  });
});

describe('fetchWithRetry', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('returns immediately on 200', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('ok', { status: 200 }));
    const res = await fetchWithRetry('https://example.com', {}, 2, 10, 30_000, 0.3);
    expect(res.ok).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('retries once on HTTP 500 then succeeds', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response('fail', { status: 500 }))
      .mockResolvedValueOnce(new Response('ok', { status: 200 }));

    const res = await fetchWithRetry('https://example.com', {}, 2, 20, 30_000, 0.3);

    expect(res.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('retries on transient network failure', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(new TypeError('network'))
      .mockResolvedValueOnce(new Response('ok', { status: 200 }));

    const res = await fetchWithRetry('https://example.com', {}, 2, 20, 30_000, 0.3);

    expect(res.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('waits Retry-After on 429 before retrying', async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response('', { status: 429, headers: { 'Retry-After': '1' } }))
      .mockResolvedValueOnce(new Response('ok', { status: 200 }));

    const promise = fetchWithRetry('https://example.com', {}, 2, 10, 30_000, 0.3);
    await vi.advanceTimersByTimeAsync(1000);
    const res = await promise;

    expect(res.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it('retries once on HTTP 408 then succeeds', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response('timeout', { status: 408 }))
      .mockResolvedValueOnce(new Response('ok', { status: 200 }));

    const res = await fetchWithRetry('https://example.com', {}, 2, 10, 30_000, 0.3);

    expect(res.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('clamps Retry-After to configured maximum', async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response('', { status: 429, headers: { 'Retry-After': '300' } }))
      .mockResolvedValueOnce(new Response('ok', { status: 200 }));

    const promise = fetchWithRetry('https://example.com', {}, 2, 10, 30_000, 0.3);
    await vi.advanceTimersByTimeAsync(60_000);
    const res = await promise;

    expect(res.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('gives up after exhausting retries', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('fail', { status: 500 }));

    const res = await fetchWithRetry('https://example.com', {}, 1, 10, 30_000, 0.3);

    expect(res.ok).toBe(false);
    expect(res.status).toBe(500);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
