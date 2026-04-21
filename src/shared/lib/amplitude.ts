import * as amplitude from '@amplitude/unified';

import { getLoggedDefaults, parseSearchParams, remapKeys } from './amplitudeFormat';

// Tracking runs in prod by default. Set VITE_AMPLITUDE_DEV_ENABLED=true to
// also send events from `npm run dev`.
const AMPLITUDE_DEV_ENABLED = import.meta.env.VITE_AMPLITUDE_DEV_ENABLED === 'true';
const AMPLITUDE_API_KEY =
  import.meta.env.PROD || AMPLITUDE_DEV_ENABLED
    ? import.meta.env.VITE_AMPLITUDE_API_KEY
    : undefined;

let hasInitializedAmplitude = false;
let lastTrackedPage = '';

export function initAmplitude() {
  if (typeof window === 'undefined' || hasInitializedAmplitude || !AMPLITUDE_API_KEY) return;

  amplitude.initAll(AMPLITUDE_API_KEY, {
    analytics: {
      autocapture: {
        pageViews: false,
      },
    },
  });
  hasInitializedAmplitude = true;
}

export function trackEvent(eventType: string, eventProperties?: Record<string, unknown>) {
  if (typeof window === 'undefined' || !AMPLITUDE_API_KEY) return;

  initAmplitude();
  amplitude.track(
    eventType,
    eventProperties ? (remapKeys(eventProperties) as Record<string, unknown>) : undefined,
  );
}

export function trackPageView(pathname: string, search: string) {
  if (!AMPLITUDE_API_KEY) return;

  const page = `${pathname}${search}`;

  if (page === lastTrackedPage) return;

  lastTrackedPage = page;

  trackEvent('page_viewed', {
    pathname,
    ...getLoggedDefaults(),
    ...parseSearchParams(search),
  });
}
