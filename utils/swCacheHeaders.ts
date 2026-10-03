/** Header set by `public/sw.js` when a response is stored or served from the SW cache. */
export const SW_CACHE_TIME_HEADER = 'X-SW-Cache-Time';

/**
 * Ensures cross-origin fetches can read {@link SW_CACHE_TIME_HEADER} in the page
 * (CORS exposes only listed response headers to JavaScript).
 */
export function mergeSwCacheExposeHeaders(source: Headers): Headers {
  const headers = new Headers(source);
  const existing = headers.get('Access-Control-Expose-Headers');
  const exposed = new Set(
    (existing ?? '')
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean),
  );
  exposed.add(SW_CACHE_TIME_HEADER);
  headers.set('Access-Control-Expose-Headers', [...exposed].join(', '));
  return headers;
}
