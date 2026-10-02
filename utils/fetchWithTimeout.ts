const isAbortError = (error: unknown): boolean =>
  error instanceof DOMException && error.name === 'AbortError';

const abortDomException = (): DOMException =>
  new DOMException('The operation was aborted.', 'AbortError');

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 15000,
): Promise<Response> {
  const controller = new AbortController();
  const external = init.signal;

  if (external) {
    if (external.aborted) {
      throw abortDomException();
    }
    external.addEventListener(
      'abort',
      () => {
        controller.abort();
      },
      { once: true },
    );
  }

  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (isAbortError(error) || external?.aborted || controller.signal.aborted) {
      throw abortDomException();
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
