import { fetchWithTimeout } from '@/utils/fetchWithTimeout';

export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const DEFAULT_TIMEOUT_MS = 20000;
const DEFAULT_BACKOFF_MS = 1000;
const MAX_RETRY_AFTER_MS = 60_000;
const MIN_RETRY_AFTER_MS = 500;

export const applyJitter = (baseMs: number, jitterFactor: number): number => {
  if (jitterFactor <= 0) return baseMs;
  const delta = baseMs * jitterFactor;
  return Math.max(0, Math.floor(baseMs + (Math.random() * 2 - 1) * delta));
};

/** Parse Retry-After as delta-seconds (Archive/CDN); falls back to exponential backoff. */
const retryAfterMs = (response: Response, fallbackMs: number, jitterFactor: number): number => {
  const raw = response.headers.get('Retry-After');
  if (raw) {
    const sec = Number.parseInt(raw, 10);
    if (!Number.isNaN(sec) && sec >= 0) {
      return Math.min(MAX_RETRY_AFTER_MS, Math.max(MIN_RETRY_AFTER_MS, sec * 1000));
    }
  }
  return applyJitter(fallbackMs, jitterFactor);
};

/**
 * HTTP GET with exponential backoff on 408/429/5xx and transient network failures.
 * Used by Internet Archive requests.
 */
export const fetchWithRetry = async (
  url: string,
  options: RequestInit = {},
  retries = 2,
  backoffMs = DEFAULT_BACKOFF_MS,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  jitterFactor = 0.3,
): Promise<Response> => {
  try {
    const response = await fetchWithTimeout(url, options, timeoutMs);

    if (response.ok) {
      return response;
    }

    if (response.status === 429 && retries > 0) {
      await delay(retryAfterMs(response, backoffMs, jitterFactor));
      const nextBackoff = backoffMs * 2;
      return fetchWithRetry(url, options, retries - 1, nextBackoff, timeoutMs, jitterFactor);
    }

    if ((response.status === 408 || response.status >= 500) && retries > 0) {
      await delay(applyJitter(backoffMs, jitterFactor));
      const nextBackoff = backoffMs * 2;
      return fetchWithRetry(url, options, retries - 1, nextBackoff, timeoutMs, jitterFactor);
    }

    return response;
  } catch (error) {
    if (retries > 0) {
      await delay(applyJitter(backoffMs, jitterFactor));
      const nextBackoff = backoffMs * 2;
      return fetchWithRetry(url, options, retries - 1, nextBackoff, timeoutMs, jitterFactor);
    }

    throw error;
  }
};
