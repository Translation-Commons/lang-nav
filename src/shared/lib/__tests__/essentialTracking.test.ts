import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CONSENT_STORAGE_KEY, CONSENT_VERSION } from '@features/consent/consentStorage';

const mocks = vi.hoisted(() => ({
  essential: { init: vi.fn(), track: vi.fn() },
  main: { initAll: vi.fn(), track: vi.fn(), setOptOut: vi.fn(), reset: vi.fn() },
  createInstance: vi.fn(),
}));

vi.mock('@amplitude/unified', () => ({
  createInstance: mocks.createInstance.mockImplementation(() => mocks.essential),
  initAll: mocks.main.initAll,
  track: mocks.main.track,
  setOptOut: mocks.main.setOptOut,
  reset: mocks.main.reset,
}));

/** Reimports the module so its module-level dedup tracker starts fresh. */
async function loadEssentialTracking() {
  vi.resetModules();
  return await import('../essentialTracking');
}

function setConsent(analytics: 'granted' | 'denied') {
  localStorage.setItem(
    CONSENT_STORAGE_KEY,
    JSON.stringify({ analytics, version: CONSENT_VERSION, timestamp: new Date().toISOString() }),
  );
}

describe('trackEssentialVisit', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubEnv('VITE_AMPLITUDE_DEV_ENABLED', 'true');
    vi.stubEnv('VITE_AMPLITUDE_API_KEY', 'test-api-key');
    mocks.essential.init.mockClear();
    mocks.essential.track.mockClear();
    Object.values(mocks.main).forEach((m) => m.mockClear());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('sends one event per pathname, ignoring repeat calls for the same pathname', async () => {
    const { trackEssentialVisit } = await loadEssentialTracking();

    trackEssentialVisit('/data', 'https://example.com');
    trackEssentialVisit('/data', 'https://example.com');

    expect(mocks.essential.track).toHaveBeenCalledTimes(1);
    expect(mocks.essential.track).toHaveBeenCalledWith('essential_visit', {
      pathname: '/data',
      referrer: 'https://example.com',
    });
  });

  it('sends a second event when the pathname changes', async () => {
    const { trackEssentialVisit } = await loadEssentialTracking();

    trackEssentialVisit('/data', '');
    trackEssentialVisit('/about', '');

    expect(mocks.essential.track).toHaveBeenCalledTimes(2);
    expect(mocks.essential.track.mock.calls[1][0]).toBe('essential_visit');
    expect(mocks.essential.track.mock.calls[1][1]).toMatchObject({ pathname: '/about' });
  });

  it('fires when consent was explicitly denied', async () => {
    setConsent('denied');
    const { trackEssentialVisit } = await loadEssentialTracking();

    trackEssentialVisit('/data', '');

    expect(mocks.essential.track).toHaveBeenCalledTimes(1);
  });

  it('fires when no consent decision has been recorded yet', async () => {
    const { trackEssentialVisit } = await loadEssentialTracking();

    trackEssentialVisit('/data', '');

    expect(mocks.essential.track).toHaveBeenCalledTimes(1);
  });

  it('never routes the event through the consent-gated main instance', async () => {
    const { trackEssentialVisit } = await loadEssentialTracking();

    trackEssentialVisit('/data', '');

    expect(mocks.main.track).not.toHaveBeenCalled();
    expect(mocks.main.initAll).not.toHaveBeenCalled();
  });

  it('initializes its own instance once, without persisted identity or autocapture', async () => {
    const { trackEssentialVisit } = await loadEssentialTracking();

    trackEssentialVisit('/data', '');
    trackEssentialVisit('/about', '');

    expect(mocks.essential.init).toHaveBeenCalledTimes(1);
    expect(mocks.essential.init).toHaveBeenCalledWith('test-api-key', {
      identityStorage: 'none',
      autocapture: false,
    });
  });

  it('does nothing when no API key is configured', async () => {
    vi.stubEnv('VITE_AMPLITUDE_API_KEY', '');
    const { trackEssentialVisit } = await loadEssentialTracking();

    trackEssentialVisit('/data', '');

    expect(mocks.essential.track).not.toHaveBeenCalled();
    expect(mocks.essential.init).not.toHaveBeenCalled();
  });

  it('truncates the referrer to its origin, dropping path and query string', async () => {
    const { trackEssentialVisit } = await loadEssentialTracking();

    trackEssentialVisit('/data', 'https://example.com/search?q=secret&page=2');

    expect(mocks.essential.track).toHaveBeenCalledWith('essential_visit', {
      pathname: '/data',
      referrer: 'https://example.com',
    });
  });

  it.each([
    ['an empty referrer', ''],
    ['a malformed referrer', 'not a url'],
  ])('reports no referrer for %s', async (_label, referrer) => {
    const { trackEssentialVisit } = await loadEssentialTracking();

    expect(() => trackEssentialVisit('/data', referrer)).not.toThrow();
    expect(mocks.essential.track).toHaveBeenCalledWith('essential_visit', {
      pathname: '/data',
      referrer: '',
    });
  });

  it('keeps its dedup tracker separate from trackPageView', async () => {
    setConsent('granted');
    const { trackEssentialVisit } = await loadEssentialTracking();
    const { trackPageView } = await import('../amplitude');

    trackEssentialVisit('/data', '');
    trackPageView('/data', '?view=Table');

    expect(mocks.essential.track).toHaveBeenCalledTimes(1);
    expect(mocks.main.track).toHaveBeenCalledTimes(1);
    expect(mocks.main.track.mock.calls[0][0]).toBe('page_viewed');
  });
});
