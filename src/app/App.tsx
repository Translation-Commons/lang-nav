import React from 'react';
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import PageFooter from '@widgets/PageFooter';
import PageNavBar from '@widgets/PageNavBar';

import ConsentBanner from '@features/consent/ConsentBanner';
import useConsent from '@features/consent/useConsent';
import HoverCardProvider from '@features/layers/hovercard/HoverCardProvider';
import PageParamsProvider from '@features/params/PageParamsProvider';

import { initAmplitude, optOutAmplitude, trackPageView } from '@shared/lib/amplitude';

import PageRoutes from './PageRoutes';

function AmplitudeTracker() {
  const location = useLocation();
  const lastPageRef = useRef('');
  const { state } = useConsent();
  const analyticsConsent = state?.analytics === 'granted';

  useEffect(() => {
    if (!analyticsConsent) {
      // User withdrew consent (or never granted it): clear any in-memory
      // identity so the currently-loaded SDK instance can't keep tracking.
      optOutAmplitude();
      return;
    }

    initAmplitude();

    const page = `${location.pathname}${location.search}`;
    if (lastPageRef.current === page) return;

    lastPageRef.current = page;
    trackPageView(location.pathname, location.search);
  }, [analyticsConsent, location.pathname, location.search]);

  return null;
}

function App() {
  return (
    <PageParamsProvider>
      <DeferredDataProvider>
        <HoverCardProvider>
          <AmplitudeTracker />
          <PageNavBar />
          <main style={{ flex: 1, minWidth: 0 }}>
            <PageRoutes />
          </main>
          <PageFooter />
          <ConsentBanner />
        </HoverCardProvider>
      </DeferredDataProvider>
    </PageParamsProvider>
  );
}

const DeferredDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [DataProvider, setDataProvider] = React.useState<
    React.ComponentType<{ children: React.ReactNode }> | undefined
  >(undefined);

  React.useEffect(() => {
    import('@features/data/context/DataProvider').then((m) => setDataProvider(() => m.default));
  }, []);

  if (!DataProvider) return <>{children}</>;

  return <DataProvider>{children}</DataProvider>;
};

export default App;
