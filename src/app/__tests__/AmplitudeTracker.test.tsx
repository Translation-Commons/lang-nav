import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ConsentChoice, ConsentState, CONSENT_VERSION } from '@features/consent/consentStorage';

import { initAmplitude, optOutAmplitude, trackPageView } from '@shared/lib/amplitude';
import { trackEssentialVisit } from '@shared/lib/essentialTracking';

import { AmplitudeTracker } from '../AmplitudeTracker';

vi.mock('@features/params/useAmplitudeParamEvents', () => ({ default: vi.fn() }));

vi.mock('@shared/lib/essentialTracking', () => ({
  trackEssentialVisit: vi.fn(),
}));

vi.mock('@shared/lib/amplitude', () => ({
  initAmplitude: vi.fn(),
  optOutAmplitude: vi.fn(),
  trackPageView: vi.fn(),
  trackEntitySwitched: vi.fn(),
  trackViewSwitched: vi.fn(),
  trackSortChanged: vi.fn(),
  trackSearchTyped: vi.fn(),
  trackFilterChanged: vi.fn(),
  trackDetailViewed: vi.fn(),
  trackDetailSwitched: vi.fn(),
}));

let consentState: ConsentState | null = null;

vi.mock('@features/consent/useConsent', () => ({
  default: () => ({
    state: consentState,
    needsDecision: consentState == null,
    accept: vi.fn(),
    decline: vi.fn(),
    reset: vi.fn(),
  }),
}));

const trackers = {
  init: initAmplitude as ReturnType<typeof vi.fn>,
  optOut: optOutAmplitude as ReturnType<typeof vi.fn>,
  essential: trackEssentialVisit as ReturnType<typeof vi.fn>,
  pageView: trackPageView as ReturnType<typeof vi.fn>,
};

function setConsent(analytics: ConsentChoice | null) {
  consentState =
    analytics == null
      ? null
      : { analytics, version: CONSENT_VERSION, timestamp: new Date().toISOString() };
}

function renderTracker(url = '/data?view=Table') {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <AmplitudeTracker />
    </MemoryRouter>,
  );
}

describe('AmplitudeTracker', () => {
  beforeEach(() => {
    Object.values(trackers).forEach((m) => m.mockClear());
    setConsent(null);
  });

  it('tracks an essential visit and skips full tracking when consent is denied', () => {
    setConsent('denied');
    renderTracker();

    expect(trackers.essential).toHaveBeenCalledWith('/data', document.referrer);
    expect(trackers.optOut).toHaveBeenCalled();
    expect(trackers.init).not.toHaveBeenCalled();
    expect(trackers.pageView).not.toHaveBeenCalled();
  });

  it('tracks an essential visit while the user has not yet decided', () => {
    renderTracker();

    expect(trackers.essential).toHaveBeenCalledWith('/data', document.referrer);
    expect(trackers.init).not.toHaveBeenCalled();
    expect(trackers.pageView).not.toHaveBeenCalled();
  });

  it('tracks a full page view and skips essential tracking when consent is granted', () => {
    setConsent('granted');
    renderTracker();

    expect(trackers.init).toHaveBeenCalled();
    expect(trackers.pageView).toHaveBeenCalledWith('/data', '?view=Table');
    expect(trackers.essential).not.toHaveBeenCalled();
    expect(trackers.optOut).not.toHaveBeenCalled();
  });

  it('tracks a full page view after consent is granted on the already-visited pathname', () => {
    const { rerender } = renderTracker();
    expect(trackers.essential).toHaveBeenCalledTimes(1);

    setConsent('granted');
    rerender(
      <MemoryRouter initialEntries={['/data?view=Table']}>
        <AmplitudeTracker />
      </MemoryRouter>,
    );

    expect(trackers.pageView).toHaveBeenCalledWith('/data', '?view=Table');
  });
});
