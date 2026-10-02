const OAUTH_QUERY_KEYS = ['code', 'state', 'error', 'error_description', 'scope'] as const;

/** OAuth redirect URI for the current origin and Vite base path. */
export function getOAuthRedirectUri(): string {
  const base = import.meta.env.BASE_URL || '/';
  const withSlash = base.startsWith('/') ? base : `/${base}`;
  const normalized = withSlash.endsWith('/') ? withSlash : `${withSlash}/`;
  return `${window.location.origin}${normalized}`;
}

/** Remove Google OAuth callback params; preserve app deep-link/search/modal params. */
export function stripOAuthParamsFromSearch(search: string): string {
  const params = new URLSearchParams(search);
  for (const key of OAUTH_QUERY_KEYS) {
    params.delete(key);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}
