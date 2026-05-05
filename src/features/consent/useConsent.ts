import { useCallback, useEffect, useState } from 'react';

import useStoredParams from '@features/params/useStoredParams';

import {
  CONSENT_CHANGE_EVENT,
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  ConsentChoice,
  ConsentState,
  isStale,
  readConsentState,
} from './consentStorage';

export interface UseConsentReturn {
  state: ConsentState | null;
  needsDecision: boolean;
  accept: () => void;
  decline: () => void;
  reset: () => void;
}

export default function useConsent(): UseConsentReturn {
  const { setValue, remove } = useStoredParams<ConsentState | null>(
    CONSENT_STORAGE_KEY,
    null,
    'local',
  );

  const [, bump] = useState(0);
  useEffect(() => {
    const handler = () => bump((n) => n + 1);
    window.addEventListener(CONSENT_CHANGE_EVENT, handler);

    // re-render on cross-tab storage events for the consent key.
    const storageHandler = (e: StorageEvent) => {
      if (e.key === CONSENT_STORAGE_KEY || e.key == null) bump((n) => n + 1);
    };
    window.addEventListener('storage', storageHandler);
    return () => {
      window.removeEventListener(CONSENT_CHANGE_EVENT, handler);
      window.removeEventListener('storage', storageHandler);
    };
  }, []);

  const commit = useCallback(
    (next: ConsentState) => {
      setValue(next);
      window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
    },
    [setValue],
  );

  const accept = useCallback(() => commit(buildState('granted')), [commit]);
  const decline = useCallback(() => commit(buildState('denied')), [commit]);

  const reset = useCallback(() => {
    remove();
    window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
  }, [remove]);

  const current = readConsentState();

  return {
    state: current,
    needsDecision: isStale(current),
    accept,
    decline,
    reset,
  };
}

function buildState(analytics: ConsentChoice): ConsentState {
  return {
    analytics,
    version: CONSENT_VERSION,
    timestamp: new Date().toISOString(),
  };
}
