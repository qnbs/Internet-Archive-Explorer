import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchWithTimeout } from '@/utils/fetchWithTimeout';

describe('fetchWithTimeout', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns response when fetch resolves within timeout', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('body', { status: 200 }));
    const res = await fetchWithTimeout('https://example.com', {}, 5000);
    expect(res.ok).toBe(true);
    expect(await res.text()).toBe('body');
  });

  it('aborts when the request exceeds timeout', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((_input, init) => {
      return new Promise((_resolve, reject) => {
        const signal = init?.signal;
        if (!signal) {
          reject(new Error('expected AbortSignal'));
          return;
        }
        const onAbort = () => reject(new DOMException('Aborted', 'AbortError'));
        if (signal.aborted) {
          onAbort();
          return;
        }
        signal.addEventListener('abort', onAbort, { once: true });
      });
    });

    await expect(fetchWithTimeout('https://slow.example', {}, 80)).rejects.toMatchObject({
      name: 'AbortError',
    });
  });
});
