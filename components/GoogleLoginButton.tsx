import React, { useEffect, useRef } from 'react';
import { useGeminiAuth } from '@/hooks/useGeminiAuth';
import { Spinner } from '@/components/Spinner';

export const GoogleLoginButton: React.FC = () => {
  const { isAuthenticated, isLoading, error, statusMessage, login, logout } = useGeminiAuth();
  const statusRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    statusRef.current?.focus();
    if (isAuthenticated) {
      const firstInteractive = document.querySelector<HTMLElement>(
        '#main-content button, #main-content a, #main-content input, #main-content [tabindex]:not([tabindex="-1"])',
      );
      firstInteractive?.focus();
    }
  }, [isAuthenticated, statusMessage]);

  return (
    <section aria-labelledby="google-auth-title" className="space-y-2">
      <h3 id="google-auth-title" className="text-sm font-semibold text-gray-900 dark:text-gray-200">
        Google OAuth (Gemini)
      </h3>

      {!isAuthenticated ? (
        <button
          type="button"
          role="button"
          aria-label="Mit Google anmelden"
          onClick={() => void login()}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && void login()}
          disabled={isLoading}
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
