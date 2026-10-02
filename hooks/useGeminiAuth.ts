import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import {
  clearStoredOAuthToken,
  getStoredOAuthTokenMeta,
  getValidAccessToken,
  setStoredOAuthToken,
} from '@/services/geminiAuthStorage';
import { fetchWithTimeout } from '@/utils/fetchWithTimeout';
import { getOAuthRedirectUri, stripOAuthParamsFromSearch } from '@/utils/oauthUrl';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_REVOKE_URL = 'https://oauth2.googleapis.com/revoke';
const SCOPE = 'openid email profile https://www.googleapis.com/auth/generative-language';
const OAUTH_CLIENT_ID_STORAGE_KEY = 'google_oauth_client_id';

const PKCE_VERIFIER_KEY = 'google_pkce_code_verifier';
const OAUTH_STATE_KEY = 'google_oauth_state';

type TokenResponse = {
  access_token: string;
  expires_in: number;
  scope: string;
  error?: string;
  error_description?: string;
};

const base64UrlEncode = (input: ArrayBuffer): string => {
  const bytes = new Uint8Array(input);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const createCodeVerifier = (): string =>
  `${crypto.randomUUID()}${crypto.randomUUID()}`.replace(/-/g, '');

const createCodeChallenge = async (verifier: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return base64UrlEncode(digest);
};

export const useGeminiAuth = () => {
  const { t } = useLanguage();
  const envClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || '';
  const getStoredClientId = (): string => {
    const stored = localStorage.getItem(OAUTH_CLIENT_ID_STORAGE_KEY)?.trim();
    return stored || '';
  };

  const [token, setToken] = useState<string | null>(() => getValidAccessToken());
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(() => t('settings:googleOAuth.notSignedIn'));
  const [error, setError] = useState<string | null>(null);
  const [runtimeClientId, setRuntimeClientId] = useState<string>(
    () => envClientId || getStoredClientId(),
  );
  const cleanupTimerRef = useRef<number | null>(null);

  const clientId = runtimeClientId;
  const isAuthenticated = useMemo(() => Boolean(token), [token]);
  const isConfigured = useMemo(() => Boolean(clientId), [clientId]);

  const setOAuthClientId = useCallback((value: string) => {
    const normalized = value.trim();
    if (normalized) {
      localStorage.setItem(OAUTH_CLIENT_ID_STORAGE_KEY, normalized);
      setRuntimeClientId(normalized);
      setError(null);
      return;
    }

    localStorage.removeItem(OAUTH_CLIENT_ID_STORAGE_KEY);
    setRuntimeClientId(import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || '');
  }, []);

  const scheduleAutoCleanup = useCallback(() => {
    if (cleanupTimerRef.current !== null) {
      window.clearTimeout(cleanupTimerRef.current);
      cleanupTimerRef.current = null;
    }

    const meta = getStoredOAuthTokenMeta();
    if (!meta) {
      return;
    }

    const msLeft = Math.max(0, meta.expiresAt - Date.now());
    cleanupTimerRef.current = window.setTimeout(() => {
      clearStoredOAuthToken();
      setToken(null);
      setStatusMessage(t('settings:googleOAuth.sessionExpired'));
    }, msLeft);
  }, [t]);

  const exchangeCodeForToken = useCallback(
    async (code: string) => {
      if (!clientId) {
        throw new Error(t('settings:googleOAuth.missingConfig'));
      }

      const verifier = sessionStorage.getItem(PKCE_VERIFIER_KEY);
      if (!verifier) {
        throw new Error(t('settings:googleOAuth.pkceFailed'));
      }

      const redirectUri = getOAuthRedirectUri();
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        redirect_uri: redirectUri,
        code_verifier: verifier,
      });

      const response = await fetchWithTimeout(
        GOOGLE_TOKEN_URL,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString(),
        },
        20000,
      );

      const data = (await response.json()) as TokenResponse;
      if (!response.ok || !data.access_token) {
        throw new Error(t('settings:googleOAuth.signInFailed'));
      }

      setStoredOAuthToken(data.access_token, data.expires_in, data.scope || SCOPE);
      setToken(data.access_token);
      setStatusMessage(t('settings:googleOAuth.signInSuccess'));
      sessionStorage.removeItem(PKCE_VERIFIER_KEY);
      sessionStorage.removeItem(OAUTH_STATE_KEY);
      scheduleAutoCleanup();
    },
    [clientId, scheduleAutoCleanup, t],
  );

  const handleRedirect = useCallback(async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const oauthError = params.get('error');

    if (!code && !oauthError) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (oauthError) {
        throw new Error(t('settings:googleOAuth.oauthError'));
      }

      const savedState = sessionStorage.getItem(OAUTH_STATE_KEY);
      if (!state || !savedState || state !== savedState) {
        throw new Error(t('settings:googleOAuth.invalidState'));
      }

      await exchangeCodeForToken(code as string);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('settings:googleOAuth.redirectFailed'));
      clearStoredOAuthToken();
      setToken(null);
    } finally {
      const cleanedSearch = stripOAuthParamsFromSearch(window.location.search);
      window.history.replaceState(
        {},
        document.title,
        `${window.location.pathname}${cleanedSearch}${window.location.hash}`,
      );
      setIsLoading(false);
    }
  }, [exchangeCodeForToken, t]);

  const login = useCallback(async () => {
    setError(null);
    if (!clientId) {
      setError(t('settings:googleOAuth.missingConfig'));
      return;
    }

    const redirectUri = getOAuthRedirectUri();
    const verifier = createCodeVerifier();
    const challenge = await createCodeChallenge(verifier);
    const state = crypto.randomUUID();

    sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier);
    sessionStorage.setItem(OAUTH_STATE_KEY, state);

    const authUrl = new URL(GOOGLE_AUTH_URL);
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', SCOPE);
    authUrl.searchParams.set('code_challenge', challenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('include_granted_scopes', 'true');
    authUrl.searchParams.set('access_type', 'online');
    authUrl.searchParams.set('prompt', 'consent');

    window.location.assign(authUrl.toString());
  }, [clientId, t]);

  const logout = useCallback(async () => {
    const currentToken = getValidAccessToken();
    clearStoredOAuthToken();
    setToken(null);
    setError(null);
    setStatusMessage(t('settings:googleOAuth.signedOut'));

    if (currentToken) {
      try {
        await fetchWithTimeout(
          `${GOOGLE_REVOKE_URL}?token=${encodeURIComponent(currentToken)}`,
          { method: 'POST' },
          10000,
        );
      } catch (revokeError) {
        void revokeError;
      }
    }
  }, [t]);

  useEffect(() => {
    void handleRedirect();
  }, [handleRedirect]);

  useEffect(() => {
    scheduleAutoCleanup();
    return () => {
      if (cleanupTimerRef.current !== null) {
        window.clearTimeout(cleanupTimerRef.current);
      }
    };
  }, [scheduleAutoCleanup]);

  useEffect(() => {
    const fromEnv = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || '';
    if (fromEnv && fromEnv !== runtimeClientId) {
      setRuntimeClientId(fromEnv);
    }
  }, [runtimeClientId]);

  return {
    token,
    isAuthenticated,
    isLoading,
    error,
    statusMessage,
    login,
    logout,
    isConfigured,
    clientId,
    setOAuthClientId,
  };
};
