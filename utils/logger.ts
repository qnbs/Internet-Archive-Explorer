/**
 * Central logging: verbose levels only when `import.meta.env.DEV` or `VITE_DEBUG_LOGS=true`.
 * Errors always go to `console.error` for production diagnostics (ErrorBoundary, failed I/O).
 */
const verboseEnabled = import.meta.env.DEV || import.meta.env.VITE_DEBUG_LOGS === 'true';

function forwardToConsole(method: 'debug' | 'info' | 'warn', args: readonly unknown[]): void {
  const c = console;
  if (method === 'debug' && typeof c.debug === 'function') {
    c.debug(...args);
    return;
  }
  if (method === 'info' && typeof c.info === 'function') {
    c.info(...args);
    return;
  }
  c.warn(...args);
}

export const logger = {
  debug: (...args: unknown[]) => {
    if (!verboseEnabled) return;
    forwardToConsole('debug', args);
  },

  info: (...args: unknown[]) => {
    if (!verboseEnabled) return;
    forwardToConsole('info', args);
  },

  warn: (...args: unknown[]) => {
    if (!verboseEnabled) return;
    forwardToConsole('warn', args);
  },

  error: (...args: unknown[]) => {
    console.error(...args);
  },
};
