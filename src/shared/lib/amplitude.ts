import * as amplitude from '@amplitude/unified';

const AMPLITUDE_API_KEY = import.meta.env.VITE_AMPLITUDE_API_KEY;

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
  amplitude.track(eventType, eventProperties);
}

function parseSearchParams(search: string): Record<string, string> {
  const params = new URLSearchParams(search);
  const result: Record<string, string> = {};

  for (const [key, value] of params.entries()) {
    if (value) result[key] = value;
  }

  return result;
}

export function trackPageView(pathname: string, search: string) {
  if (!AMPLITUDE_API_KEY) return;

  const page = `${pathname}${search}`;

  if (page === lastTrackedPage) return;

  lastTrackedPage = page;

  trackEvent('page_viewed', {
    page,
    pathname,
    params: parseSearchParams(search),
  });
}
