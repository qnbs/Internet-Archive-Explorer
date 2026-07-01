/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  /** Dev-only demo fallback; requires `VITE_ALLOW_BUILD_TIME_GEMINI_KEY=true`. Prefer in-app BYOK. */
  readonly VITE_API_KEY?: string;
  /** When `"true"` in dev, allows `VITE_API_KEY` as fallback (never for production AI flows). */
  readonly VITE_ALLOW_BUILD_TIME_GEMINI_KEY?: string;
  readonly VITE_RECROOM_OPEN_ON_ARCHIVE?: string;
  /** When `"true"`, enables verbose `logger.warn` / `logger.debug` in production builds. */
  readonly VITE_DEBUG_LOGS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
