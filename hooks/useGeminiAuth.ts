import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchWithTimeout } from '@/utils/fetchWithTimeout';
import {
  clearStoredOAuthToken,
  getStoredOAuthTokenMeta,
  getValidAccessToken,
  setStoredOAuthToken,
} from '@/services/geminiAuthStorage';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_REVOKE_URL = 'https://oauth2.googleapis.com/revoke';
const REDIRECT_URI = 'https://qnbs.github.io/Internet-Archive-Explorer/';
const SCOPE = 'openid email profile https://www.googleapis.com/auth/generative-language';

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
  const [token, setToken] = useState<string | null>(() => getValidAccessToken());
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Nicht angemeldet');
  const [error, setError] = useState<string | null>(null);
  const cleanupTimerRef = useRef<number | null>(null);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isAuthenticated = useMemo(() => Boolean(token), [token]);

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
      setStatusMessage('Sitzung abgelaufen – bitte erneut anmelden');
    }, msLeft);
  }, []);

  const exchangeCodeForToken = useCallback(
    async (code: string) => {
      if (!clientId) {
        throw new Error('OAuth-Konfiguration fehlt.');
      }

      const verifier = sessionStorage.getItem(PKCE_VERIFIER_KEY);
      if (!verifier) {
        throw new Error('PKCE-Prüfung fehlgeschlagen.');
      }

      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        redirect_uri: REDIRECT_URI,
        code_verifier: verifier,
      });

      const response = await fetchWithTimeout(
        GOOGLE_TOKEN_URL,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString(),
        },
        20000
      );

      const data = (await response.json()) as TokenResponse;
      if (!response.ok || !data.access_token) {
        throw new Error('Anmeldung fehlgeschlagen.');
      }

      setStoredOAuthToken(data.access_token, data.expires_in, data.scope || SCOPE);
      setToken(data.access_token);
      setStatusMessage('Anmeldung erfolgreich – Gemini ist aktiviert');
      sessionStorage.removeItem(PKCE_VERIFIER_KEY);
      sessionStorage.removeItem(OAUTH_STATE_KEY);
      scheduleAutoCleanup();
    },
    [clientId, scheduleAutoCleanup]
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
        throw new Error('OAuth-Fehler');
      }

      const savedState = sessionStorage.getItem(OAUTH_STATE_KEY);
      if (!state || !savedState || state !== savedState) {
        throw new Error('OAuth-State ungültig.');
      }

      await exchangeCodeForToken(code as string);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'OAuth-Redirect fehlgeschlagen.');
      clearStoredOAuthToken();
      setToken(null);
    } finally {
      window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.hash}`);
      setIsLoading(false);
    }
  }, [exchangeCodeForToken]);

  const login = useCallback(async () => {
    setError(null);
    if (!clientId) {
      setError('OAuth-Konfiguration fehlt.');
      return;
    }

    const verifier = createCodeVerifier();
    const challenge = await createCodeChallenge(verifier);
    const state = crypto.randomUUID();

    sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier);
    sessionStorage.setItem(OAUTH_STATE_KEY, state);

    const authUrl = new URL(GOOGLE_AUTH_URL);
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', SCOPE);
    authUrl.searchParams.set('code_challenge', challenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('include_granted_scopes', 'true');
    authUrl.searchParams.set('access_type', 'online');
    authUrl.searchParams.set('prompt', 'consent');

    window.location.assign(authUrl.toString());
  }, [clientId]);

  const logout = useCallback(async () => {
    const currentToken = getValidAccessToken();
    clearStoredOAuthToken();
    setToken(null);
    setError(null);
    setStatusMessage('Abgemeldet');

    if (currentToken) {
      try {
        await fetchWithTimeout(
          `${GOOGLE_REVOKE_URL}?token=${encodeURIComponent(currentToken)}`,
          { method: 'POST' },
          10000
        );
      } catch {
      }
    }
  }, []);

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

  return { token, isAuthenticated, isLoading, error, statusMessage, login, logout };
};