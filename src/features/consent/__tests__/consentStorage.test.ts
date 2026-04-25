import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CONSENT_MAX_AGE_DAYS,
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  hasAnalyticsConsent,
  isStale,
  readConsentState,
} from '../consentStorage';

describe('consentStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('readConsentState', () => {
    it('returns null when nothing is stored', () => {
      expect(readConsentState()).toBeNull();
    });

    it('returns null when stored value is not valid JSON', () => {
      localStorage.setItem(CONSENT_STORAGE_KEY, 'not-json{');
      expect(readConsentState()).toBeNull();
    });

    it('returns null when stored value has the wrong shape', () => {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ foo: 'bar' }));
      expect(readConsentState()).toBeNull();
    });

    it('returns the parsed state when valid', () => {
      const state = {
        analytics: 'granted',
        version: CONSENT_VERSION,
        timestamp: '2026-04-22T00:00:00.000Z',
      };
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
      expect(readConsentState()).toEqual(state);
    });
  });

  describe('isStale', () => {
    it('treats null as stale', () => {
      expect(isStale(null)).toBe(true);
    });

    it('treats a version mismatch as stale', () => {
      expect(
        isStale({
          analytics: 'granted',
          version: CONSENT_VERSION + 1,
          timestamp: new Date().toISOString(),
        }),
      ).toBe(true);
    });

    it('treats consent older than the max age as stale', () => {
      const tooOld = new Date();
      tooOld.setDate(tooOld.getDate() - (CONSENT_MAX_AGE_DAYS + 1));
      expect(
        isStale({
          analytics: 'granted',
          version: CONSENT_VERSION,
          timestamp: tooOld.toISOString(),
        }),
      ).toBe(true);
    });

    it('treats fresh, current-version consent as not stale', () => {
      expect(
        isStale({
          analytics: 'denied',
          version: CONSENT_VERSION,
          timestamp: new Date().toISOString(),
        }),
      ).toBe(false);
    });

    it('treats an unparseable timestamp as stale', () => {
      expect(
        isStale({
          analytics: 'granted',
          version: CONSENT_VERSION,
          timestamp: 'not-a-date',
        }),
      ).toBe(true);
    });
  });

  describe('hasAnalyticsConsent', () => {
    it('is false when no state is stored', () => {
      expect(hasAnalyticsConsent()).toBe(false);
    });

    it('is false when the user declined', () => {
      localStorage.setItem(
        CONSENT_STORAGE_KEY,
        JSON.stringify({
          analytics: 'denied',
          version: CONSENT_VERSION,
          timestamp: new Date().toISOString(),
        }),
      );
      expect(hasAnalyticsConsent()).toBe(false);
    });

    it('is true when the user accepted and the record is fresh', () => {
      localStorage.setItem(
        CONSENT_STORAGE_KEY,
        JSON.stringify({
          analytics: 'granted',
          version: CONSENT_VERSION,
          timestamp: new Date().toISOString(),
        }),
      );
      expect(hasAnalyticsConsent()).toBe(true);
    });

    it('is false when consent is stale even if analytics was granted', () => {
      const tooOld = new Date();
      tooOld.setDate(tooOld.getDate() - (CONSENT_MAX_AGE_DAYS + 1));
      localStorage.setItem(
        CONSENT_STORAGE_KEY,
        JSON.stringify({
          analytics: 'granted',
          version: CONSENT_VERSION,
          timestamp: tooOld.toISOString(),
        }),
      );
      expect(hasAnalyticsConsent()).toBe(false);
    });
  });
});
