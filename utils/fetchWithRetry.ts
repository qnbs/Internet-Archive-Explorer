import { fetchWithTimeout } from '@/utils/fetchWithTimeout';

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const DEFAULT_TIMEOUT_MS = 20000;

/** Parse Retry-After as delta-seconds (Archive/CDN); falls back to exponential backoff. */
function retryAfterMs(response: Response, fallbackMs: number): number {
  const raw = response.headers.get('Retry-After');
  if (!raw) return fallbackMs;
  const sec = Number.parseInt(raw, 10);
  if (!Number.isNaN(sec) && sec >= 0) {
    return Math.min(120_000, Math.max(500, sec * 1000));
  }
  return fallbackMs;
}

/**
 * HTTP GET with exponential backoff on 408/429/5xx and transient network failures.
 * Used by Internet Archive requests.
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 2,
  backoffMs = 400,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  try {
    const response = await fetchWithTimeout(url, options, timeoutMs);

    if (response.ok) {
      return response;
    }

    if (response.status === 429 && retries > 0) {
      await delay(retryAfterMs(response, backoffMs));
      return fetchWithRetry(url, options, retries - 1, backoffMs * 2, timeoutMs);
    }

    if ((response.status === 408 || response.status >= 500) && retries > 0) {
      await delay(backoffMs);
      return fetchWithRetry(url, options, retries - 1, backoffMs * 2, timeoutMs);
    }

    return response;
  } catch (error) {
    if (retries > 0) {
      await delay(backoffMs);
      return fetchWithRetry(url, options, retries - 1, backoffMs * 2, timeoutMs);
    }

    throw error;
  }
}
