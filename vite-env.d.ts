/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_API_KEY?: string;
  readonly VITE_RECROOM_OPEN_ON_ARCHIVE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
