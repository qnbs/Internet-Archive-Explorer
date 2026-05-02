/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_API_KEY?: string;
  readonly VITE_RECROOM_OPEN_ON_ARCHIVE?: string;
  /** When `"true"`, enables verbose `logger.warn` / `logger.debug` in production builds. */
  readonly VITE_DEBUG_LOGS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
