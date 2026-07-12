import { afterEach, describe, expect, it } from 'vitest';
import {
  promiseAllWithConcurrency,
  resetArchiveOrgQueueForTests,
  withArchiveOrgConcurrency,
} from '@/utils/requestQueue';

describe('withArchiveOrgConcurrency', () => {
  afterEach(() => {
    resetArchiveOrgQueueForTests();
  });

  it('returns results in submission order and respects the concurrency limit', async () => {
    let running = 0;
    let maxRunning = 0;
    const startTimes: Record<number, number> = {};
    const endTimes: Record<number, number> = {};

    const createTask = (id: number, ms: number) => async () => {
      running += 1;
      maxRunning = Math.max(maxRunning, running);
      startTimes[id] = Date.now();
      await new Promise((resolve) => setTimeout(resolve, ms));
      endTimes[id] = Date.now();
      running -= 1;
      return id;
    };

    const results = await Promise.all([
      withArchiveOrgConcurrency(createTask(1, 30)),
      withArchiveOrgConcurrency(createTask(2, 10)),
      withArchiveOrgConcurrency(createTask(3, 20)),
      withArchiveOrgConcurrency(createTask(4, 10)),
    ]);

    expect(results).toEqual([1, 2, 3, 4]);
    expect(maxRunning).toBeLessThanOrEqual(3);
    expect(startTimes[4]).toBeGreaterThanOrEqual(endTimes[2] ?? 0);
  });

  it('propagates task errors', async () => {
    await expect(
      withArchiveOrgConcurrency(() => Promise.reject(new Error('boom'))),
    ).rejects.toThrow('boom');
  });
});

describe('promiseAllWithConcurrency', () => {
  it('returns results in original order', async () => {
    const tasks = [() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3)];
    const results = await promiseAllWithConcurrency(tasks, 2);
    expect(results).toEqual([1, 2, 3]);
  });

  it('never runs more than the requested concurrency', async () => {
    let running = 0;
    let maxRunning = 0;

    const tasks = Array.from({ length: 6 }, () => async () => {
      running += 1;
      maxRunning = Math.max(maxRunning, running);
      await new Promise((resolve) => setTimeout(resolve, 20));
      running -= 1;
      return running;
    });

    await promiseAllWithConcurrency(tasks, 2);
    expect(maxRunning).toBeLessThanOrEqual(2);
  });

  it('rejects on first failure', async () => {
    const tasks = [
      () => Promise.resolve(1),
      () => Promise.reject(new Error('failed')),
      () => Promise.resolve(3),
    ];
    await expect(promiseAllWithConcurrency(tasks, 2)).rejects.toThrow('failed');
  });

  it('throws on invalid concurrency', async () => {
    await expect(promiseAllWithConcurrency([], 0)).rejects.toThrow('concurrency must be');
    await expect(promiseAllWithConcurrency([], -1)).rejects.toThrow('concurrency must be');
    await expect(promiseAllWithConcurrency([], 1.5)).rejects.toThrow('concurrency must be');
  });
});
