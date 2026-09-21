import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import useConsent from '@features/consent/useConsent';
import useAmplitudeParamEvents from '@features/params/useAmplitudeParamEvents';

import { initAmplitude, optOutAmplitude, trackPageView } from '@shared/lib/amplitude';
import { trackEssentialVisit } from '@shared/lib/essentialTracking';

function AmplitudeTracker() {
  const location = useLocation();
  const { state } = useConsent();
  const analyticsConsent = state?.analytics === 'granted';

  useAmplitudeParamEvents();

  useEffect(() => {
    if (!analyticsConsent) {
      optOutAmplitude();
      trackEssentialVisit(location.pathname, document.referrer);
      return;
    }

    initAmplitude();
    trackPageView(location.pathname, location.search);
  }, [analyticsConsent, location.pathname, location.search]);

  return null;
}

export default AmplitudeTracker;
