import * as amplitude from '@amplitude/unified';

import { hasAnalyticsConsent } from '@features/consent/consentStorage';

import { AMPLITUDE_API_KEY } from './amplitudeConfig';
import { getLoggedDefaults, parseSearchParams, remapKeys } from './amplitudeFormat';

let hasInitializedAmplitude = false;
let lastTrackedPathname = '';

/**
 * Initialize the Amplitude SDK, gated on user consent.
 *
 * GDPR: initialization is deferred until the user has granted analytics
 * consent. Amplitude's own docs suggests to avoid calling `init` (which
 * writes a device ID to localStorage and starts a session) before consent lands.
 *
 * If the SDK was initialized earlier in the session and later opted out,
 * this call re-enables tracking via `setOptOut(false)` instead of a full
 * re-init.
 */
export function initAmplitude() {
  if (typeof window === 'undefined' || !AMPLITUDE_API_KEY) return;
  if (!hasAnalyticsConsent()) return;

  if (hasInitializedAmplitude) {
    // SDK was initialized earlier and then opted out; re-enable tracking.
    amplitude.setOptOut(false);
    return;
  }

  amplitude.initAll(AMPLITUDE_API_KEY, {
    analytics: {
      /* Store the device ID in localStorage, never in cookies. Our privacy
         policy states that LangNav does not use cookies, and the default
         Amplitude setting would write an AMP_<key> cookie at init time. */
      identityStorage: 'localStorage',
      autocapture: {
        pageViews: false,
      },
    },
  });
  hasInitializedAmplitude = true;
}

export function trackEvent(eventType: string, eventProperties?: Record<string, unknown>) {
  if (typeof window === 'undefined' || !AMPLITUDE_API_KEY) return;
  if (!hasAnalyticsConsent()) return;

  initAmplitude();
  amplitude.track(
    eventType,
    eventProperties ? (remapKeys(eventProperties) as Record<string, unknown>) : undefined,
  );
}

/**
 * Fires once per route (pathname) change. Search-string changes from filter,
 * search, or detail interactions are intentionally ignored here — they have
 * their own `explore_*` events. The current search-string snapshot still
 * rides on the event so an Amplitude analyst sees the entry state.
 */
export function trackPageView(pathname: string, search: string) {
  if (!AMPLITUDE_API_KEY) return;
  if (pathname === lastTrackedPathname) return;

  lastTrackedPathname = pathname;

  trackEvent('page_viewed', {
    pathname,
    ...getLoggedDefaults(),
    ...parseSearchParams(search),
  });
}

type ExploreBaseProps = {
  path: string;
  view?: string;
  entity?: string;
};

export type SearchTrigger = 'typed' | 'suggestion';

export function trackEntitySwitched(props: ExploreBaseProps & { previous_entity?: string }) {
  trackEvent('explore_entity_switched', props);
}

export function trackViewSwitched(props: ExploreBaseProps & { previous_view?: string }) {
  trackEvent('explore_view_switched', props);
}

export function trackSortChanged(props: ExploreBaseProps & { sort: string[] }) {
  trackEvent('explore_sort_changed', props);
}

export function trackSearchTyped(
  props: ExploreBaseProps & {
    search_string: string;
    search_by?: string;
    cleared: boolean;
    result_count: number;
    trigger: SearchTrigger;
  },
) {
  trackEvent('explore_search_typed', props);
}

export function trackFilterChanged(
  props: ExploreBaseProps & {
    filter_key: string;
    filter_value: unknown;
    previous_value: unknown;
    filter_action: string;
  },
) {
  trackEvent('explore_filter_changed', props);
}

export function trackDetailViewed(props: ExploreBaseProps & { entity_id: string }) {
  trackEvent('explore_detail_viewed', props);
}

export function trackDetailSwitched(
  props: ExploreBaseProps & { ent: string; previous_ent: string },
) {
  trackEvent('explore_detail_switched', props);
}

const AMPLITUDE_STORAGE_KEY_PATTERN = /^(AMP_|amplitude_|amp_|amplitude)/i;

// amplitude.reset() only regenerates the device ID, so we sweep storage manually.
export function clearAmplitudeLocalStorage() {
  if (typeof window === 'undefined') return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && AMPLITUDE_STORAGE_KEY_PATTERN.test(key)) keysToRemove.push(key);
    }
    for (const key of keysToRemove) localStorage.removeItem(key);
  } catch {
    // localStorage access can throw in locked-down browsers; nothing to do.
  }
}

// Cleans up cookies from before identityStorage: 'localStorage' was the default.
export function clearAmplitudeCookies() {
  if (typeof document === 'undefined') return;
  const cookies = document.cookie ? document.cookie.split(';') : [];
  for (const entry of cookies) {
    const name = entry.split('=')[0]?.trim();
    if (!name || !AMPLITUDE_STORAGE_KEY_PATTERN.test(name)) continue;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
}

export function clearAmplitudeStorage() {
  clearAmplitudeLocalStorage();
  clearAmplitudeCookies();
}

// Runs before consent so visitors upgrading from the cookie-based version get cleaned up.
if (typeof window !== 'undefined') clearAmplitudeCookies();

export function optOutAmplitude() {
  if (!hasInitializedAmplitude) {
    clearAmplitudeStorage();
    return;
  }
  amplitude.setOptOut(true);
  try {
    amplitude.reset();
  } catch {
    // reset() can throw if the SDK never fully loaded.
  }
  clearAmplitudeStorage();
  lastTrackedPathname = '';
}
