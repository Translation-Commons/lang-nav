export type ConsentChoice = 'granted' | 'denied';

export type ConsentState = {
  analytics: ConsentChoice;
  version: number;
  timestamp: string;
};

export const CONSENT_STORAGE_KEY = 'langnav.consent';

/**
 * Schema version of the persisted consent record. Bump when the set of
 * categories changes (e.g. adding marketing) or when the wording
 * changes. Every user is re-prompted on a version bump.
 */
export const CONSENT_VERSION = 1;

export const CONSENT_MAX_AGE_DAYS = 365;

export const CONSENT_CHANGE_EVENT = 'langnav:consent-change';

export function readConsentState(): ConsentState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (raw == null) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!isConsentState(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function isStale(state: ConsentState | null): boolean {
  if (state == null) return true;
  if (state.version !== CONSENT_VERSION) return true;
  const given = Date.parse(state.timestamp);
  if (Number.isNaN(given)) return true;
  const ageMs = Date.now() - given;
  return ageMs > CONSENT_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
}

export function hasAnalyticsConsent(): boolean {
  const state = readConsentState();
  if (isStale(state)) return false;
  return state?.analytics === 'granted';
}

function isConsentState(value: unknown): value is ConsentState {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    (v.analytics === 'granted' || v.analytics === 'denied') &&
    typeof v.version === 'number' &&
    typeof v.timestamp === 'string'
  );
}
