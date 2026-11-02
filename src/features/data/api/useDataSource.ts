import { useEffect, useState } from 'react';

import { checkApiAvailable, DataSource, getDataSource, getKnownApiAvailability } from './apiClient';

/** Whether the API answered the startup health check; undefined while it runs. */
export function useApiAvailable(enabled: boolean): boolean | undefined {
  const [available, setAvailable] = useState(getKnownApiAvailability);
  useEffect(() => {
    if (!enabled || available !== undefined) return;
    let mounted = true;
    checkApiAvailable().then((ok) => mounted && setAvailable(ok));
    return () => {
      mounted = false;
    };
  }, [enabled, available]);
  return available;
}

/** The source in use: Local when the viewer chose API but the backend is unreachable. */
export function useEffectiveDataSource(): DataSource {
  const chosen = getDataSource();
  const apiAvailable = useApiAvailable(chosen === DataSource.API);
  return chosen === DataSource.API && apiAvailable === false ? DataSource.Local : chosen;
}
