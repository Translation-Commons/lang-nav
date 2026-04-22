import * as amplitude from '@amplitude/unified';

import { hasAnalyticsConsent } from '@features/consent/consentStorage';

import { getLoggedDefaults, parseSearchParams, remapKeys } from './amplitudeFormat';

/**
 * Tracking runs in prod by default. Set VITE_AMPLITUDE_DEV_ENABLED=true to
 * also send events from `npm run dev`.
 */
const AMPLITUDE_DEV_ENABLED = import.meta.env.VITE_AMPLITUDE_DEV_ENABLED === 'true';
const AMPLITUDE_API_KEY =
  import.meta.env.PROD || AMPLITUDE_DEV_ENABLED
    ? import.meta.env.VITE_AMPLITUDE_API_KEY
    : undefined;

let hasInitializedAmplitude = false;
let lastTrackedPage = '';

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
    try {
      amplitude.setOptOut(false);
    } catch {
      // Suppress: older SDK builds may not expose setOptOut.
    }
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

const AMPLITUDE_STORAGE_KEY_PATTERN = /^(AMP_|amplitude_|amp_|amplitude)/i;

/**
 * Removes every Amplitude-owned entry from localStorage.
 *
 * Exported for tests and defense in depth; `amplitude.reset()` alone only
 * regenerates the device ID rather than deleting the persisted entry, so we
 * sweep the storage manually after opt-out.
 */
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

/**
 * Deletes any `AMP_*` cookies left over from a time when the SDK was
 * configured with its default cookie-based identity storage. We now pass
 * `identityStorage: 'localStorage'` at init, so no new cookies are written,
 * but existing visitors may still have stale cookies from a prior session.
 */
export function clearAmplitudeCookies() {
  if (typeof document === 'undefined') return;
  const cookies = document.cookie ? document.cookie.split(';') : [];
  for (const entry of cookies) {
    const name = entry.split('=')[0]?.trim();
    if (!name || !AMPLITUDE_STORAGE_KEY_PATTERN.test(name)) continue;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
}

/**
 * Clears all persisted Amplitude state: localStorage entries and any
 * leftover cookies from a previous cookie-based configuration.
 */
export function clearAmplitudeStorage() {
  clearAmplitudeLocalStorage();
  clearAmplitudeCookies();
}

/* Sweep stale AMP_* cookies once at module load so visitors upgrading from
   the cookie-based version get cleaned up even if they never open the
   banner. Safe to run before consent because it only removes, never writes. */
if (typeof window !== 'undefined') clearAmplitudeCookies();

/**
 * Called when a user revokes consent. Three layers of defense:
 *
 *   1. `setOptOut(true)`: Amplitude's documented "stop sending" switch, so
 *      anything still buffered in memory won't flush.
 *   2. `reset()`: clears the in-memory device/user identity.
 *   3. `clearAmplitudeStorage()`: removes the persisted device ID and any
 *      unsent-event buffers from localStorage, so a later re-consent starts
 *      with a genuinely new identity.
 *
 * The module-level `hasInitializedAmplitude` flag stays true: the SDK code
 * is already loaded into the page and can't be unloaded without a reload.
 */
export function optOutAmplitude() {
  if (!hasInitializedAmplitude) {
    /* Stale entries from a prior visit may still be on disk even if we
       never initialized the SDK this session; wipe them. */
    clearAmplitudeStorage();
    return;
  }
  try {
    amplitude.setOptOut(true);
  } catch {
    // Suppress: older SDK builds may not expose setOptOut.
  }
  try {
    amplitude.reset();
  } catch {
    // Suppress: reset can throw if SDK never fully loaded.
  }
  clearAmplitudeStorage();
  lastTrackedPage = '';
}
