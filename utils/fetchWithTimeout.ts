const isAbortError = (error: unknown): boolean =>
  error instanceof DOMException && error.name === 'AbortError';

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 15000,
): Promise<Response> {
  const controller = new AbortController();
  const external = init.signal;

  if (external) {
    if (external.aborted) {
      throw external.reason ?? new DOMException('The operation was aborted.', 'AbortError');
    }
    external.addEventListener(
      'abort',
      () => {
        controller.abort(external.reason);
      },
      { once: true },
    );
  }

  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (isAbortError(error) && external?.aborted) {
      throw external.reason ?? error;
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
