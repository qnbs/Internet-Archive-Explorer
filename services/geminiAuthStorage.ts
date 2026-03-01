type StoredOAuthToken = {
  accessToken: string;
  expiresAt: number;
  scope: string;
  secure: true;
};

export const GEMINI_OAUTH_STORAGE_KEY = 'gemini_oauth_token_v1';

let inMemoryToken: StoredOAuthToken | null = null;

const isValid = (token: StoredOAuthToken | null): token is StoredOAuthToken =>
  !!token && Date.now() < token.expiresAt;

export const setStoredOAuthToken = (accessToken: string, expiresInSeconds: number, scope: string) => {
  const ttl = Math.max(60, Math.min(expiresInSeconds, 3600) - 60);
  const token: StoredOAuthToken = {
    accessToken,
    expiresAt: Date.now() + ttl * 1000,
    scope,
    secure: true,
  };
  inMemoryToken = token;
  localStorage.setItem(GEMINI_OAUTH_STORAGE_KEY, JSON.stringify(token));
};

export const getStoredOAuthTokenMeta = (): StoredOAuthToken | null => {
  if (isValid(inMemoryToken)) return inMemoryToken;
  try {
    const raw = localStorage.getItem(GEMINI_OAUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredOAuthToken;
    if (!isValid(parsed)) {
      clearStoredOAuthToken();
      return null;
    }
    inMemoryToken = parsed;
    return parsed;
  } catch {
    clearStoredOAuthToken();
    return null;
  }
};

export const getValidAccessToken = (): string | null => getStoredOAuthTokenMeta()?.accessToken ?? null;

export const clearStoredOAuthToken = () => {
  inMemoryToken = null;
  localStorage.removeItem(GEMINI_OAUTH_STORAGE_KEY);
};