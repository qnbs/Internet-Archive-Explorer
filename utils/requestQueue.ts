interface QueueItem<T> {
  task: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
}

/**
 * A simple per-host concurrency limiter.
 *
 * Internet Archive endpoints can be sensitive to bursts; this queue caps the
 * number of in-flight requests to reduce 429s and browser connection contention.
 */
class HostRequestQueue {
  private running = 0;
  private readonly queue: QueueItem<unknown>[] = [];

  constructor(private readonly maxConcurrency: number) {}

  enqueue<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject } as QueueItem<unknown>);
      this.process();
    });
  }

  private process(): void {
    if (this.running >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }

    const item = this.queue.shift();
    if (!item) return;

    this.running += 1;
    item
      .task()
      .then(item.resolve)
      .catch(item.reject)
      .finally(() => {
        this.running -= 1;
        this.process();
      });
  }
}

const ARCHIVE_ORG_MAX_CONCURRENCY = 3;
const archiveOrgQueue = new HostRequestQueue(ARCHIVE_ORG_MAX_CONCURRENCY);

/**
 * Run the given task while respecting the archive.org concurrency limit.
 */
export function withArchiveOrgConcurrency<T>(task: () => Promise<T>): Promise<T> {
  return archiveOrgQueue.enqueue(task);
}

/**
 * Execute a list of async tasks with a bounded concurrency.
 *
 * Useful when a single component needs to fire multiple independent requests
 * without exhausting the per-host connection pool.
 */
export async function promiseAllWithConcurrency<T>(
  tasks: Array<() => Promise<T>>,
  concurrency: number,
): Promise<T[]> {
  if (concurrency <= 0) {
    throw new Error('concurrency must be greater than 0');
  }

  const results: T[] = new Array(tasks.length);
  let index = 0;

  async function worker(): Promise<void> {
    while (index < tasks.length) {
      const currentIndex = index++;
      results[currentIndex] = await tasks[currentIndex]();
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker());
  await Promise.all(workers);
  return results;
}
