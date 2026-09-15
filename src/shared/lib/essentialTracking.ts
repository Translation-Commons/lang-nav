import * as amplitude from '@amplitude/unified';

import { AMPLITUDE_API_KEY } from './amplitudeConfig';

// Separate instance so essential pings never share identity or opt-out state with the consented client.
const essentialAmplitude = amplitude.createInstance();
let hasInitializedEssential = false;
let lastTrackedEssentialPathname = '';

// Drops path/query so only the origin (which site sent them) is ever sent.
function toReferrerOrigin(referrer: string): string {
  try {
    return new URL(referrer).origin;
  } catch {
    return '';
  }
}

// Not gated on consent: identityStorage 'none' keeps the ID in memory only, and
// autocapture is off, so this instance never sends more than the one explicit event.
export function initEssentialTracking() {
  if (typeof window === 'undefined' || !AMPLITUDE_API_KEY) return;
  if (hasInitializedEssential) return;

  essentialAmplitude.init(AMPLITUDE_API_KEY, {
    identityStorage: 'none',
    autocapture: false,
  });
  hasInitializedEssential = true;
}

// Fires while the visitor hasn't granted analytics consent; page_viewed covers them after.
export function trackEssentialVisit(pathname: string, referrer: string) {
  if (typeof window === 'undefined' || !AMPLITUDE_API_KEY) return;
  if (pathname === lastTrackedEssentialPathname) return;

  lastTrackedEssentialPathname = pathname;

  initEssentialTracking();
  essentialAmplitude.track('essential_visit', {
    pathname,
    referrer: toReferrerOrigin(referrer),
  });
}
