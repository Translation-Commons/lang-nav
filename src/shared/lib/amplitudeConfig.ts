/**
 * Tracking runs in prod by default. Set VITE_AMPLITUDE_DEV_ENABLED=true to
 * also send events from `npm run dev`.
 */
const AMPLITUDE_DEV_ENABLED = import.meta.env.VITE_AMPLITUDE_DEV_ENABLED === 'true';

export const AMPLITUDE_API_KEY =
  import.meta.env.PROD || AMPLITUDE_DEV_ENABLED
    ? import.meta.env.VITE_AMPLITUDE_API_KEY
    : undefined;
