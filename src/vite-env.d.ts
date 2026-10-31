/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AMPLITUDE_API_KEY?: string;
  readonly VITE_LANGNAV_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
