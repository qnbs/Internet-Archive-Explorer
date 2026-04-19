import React, { useEffect, useRef } from 'react';
import { Spinner } from '@/components/Spinner';
import { useGeminiAuth } from '@/hooks/useGeminiAuth';

export const GoogleLoginButton: React.FC = () => {
  const {
    isAuthenticated,
    isLoading,
    error,
    statusMessage,
    login,
    logout,
    isConfigured,
    clientId,
    setOAuthClientId,
  } = useGeminiAuth();
  const statusRef = useRef<HTMLParagraphElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    statusRef.current?.focus();
    if (isAuthenticated) {
      const firstInteractive = document.querySelector<HTMLElement>(
        '#main-content button, #main-content a, #main-content input, #main-content [tabindex]:not([tabindex="-1"])',
      );
      firstInteractive?.focus();
    }
  }, [isAuthenticated, statusMessage]);

  useEffect(() => {
    if (!isConfigured) {
      inputRef.current?.focus();
    }
  }, [isConfigured]);

  return (
    <section aria-labelledby="google-auth-title" className="space-y-2">
      <h3 id="google-auth-title" className="text-sm font-semibold text-gray-900 dark:text-gray-200">
        Google OAuth (Gemini)
      </h3>

      {!isConfigured && (
        <div className="space-y-2 rounded-lg border border-amber-300/60 bg-amber-50/70 p-3 dark:border-amber-700/60 dark:bg-amber-900/20">
          <p className="text-xs text-amber-800 dark:text-amber-200">
            OAuth Client-ID fehlt im Deploy. Trage eine Google OAuth Client-ID (Web) ein.
          </p>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={clientId}
              onChange={(e) => setOAuthClientId(e.target.value)}
              placeholder="1234567890-xxxxx.apps.googleusercontent.com"
              className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:border-amber-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
        </div>
      )}

      {!isAuthenticated ? (
        <button
          type="button"
          role="button"
          aria-label="Mit Google anmelden"
          onClick={() => void login()}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && void login()}
          disabled={isLoading || !isConfigured}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        >
          {isLoading ? <Spinner /> : null}
          <span>{isLoading ? 'Anmeldung läuft…' : 'Mit Google anmelden'}</span>
        </button>
      ) : (
        <button
          type="button"
          role="button"
          aria-label="Von Google abmelden"
          onClick={() => void logout()}
          className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          Logout
        </button>
      )}

      <p
        ref={statusRef}
        tabIndex={-1}
        aria-live="polite"
        className={`text-sm ${error ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-300'}`}
      >
        {error || statusMessage}
      </p>
    </section>
  );
};

export default GoogleLoginButton;
