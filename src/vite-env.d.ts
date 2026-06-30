/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AMPLITUDE_API_KEY?: string;
  // Base URL of the feedback Cloudflare Worker, e.g. https://lang-nav-feedback.<acct>.workers.dev
  readonly VITE_FEEDBACK_API_URL?: string;
  // Cloudflare Turnstile site key. When set, the feedback form renders a
  // Turnstile challenge and sends its token with submissions. Optional.
  readonly VITE_TURNSTILE_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
