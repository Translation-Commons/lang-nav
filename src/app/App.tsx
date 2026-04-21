import React from 'react';
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import PageFooter from '@widgets/PageFooter';
import PageNavBar from '@widgets/PageNavBar';

import HoverCardProvider from '@features/layers/hovercard/HoverCardProvider';
import PageParamsProvider from '@features/params/PageParamsProvider';

import { initAmplitude, trackPageView } from '@shared/lib/amplitude';

import PageRoutes from './PageRoutes';

function AmplitudeTracker() {
  const location = useLocation();
  const lastPageRef = useRef('');

  useEffect(() => {
    initAmplitude();

    const page = `${location.pathname}${location.search}`;

    if (lastPageRef.current === page) return;

    lastPageRef.current = page;
    trackPageView(location.pathname, location.search);
  }, [location.pathname, location.search]);

  return null;
}

function App() {
  return (
    <PageParamsProvider>
      <DeferredDataProvider>
        <HoverCardProvider>
          <AmplitudeTracker />
          <PageNavBar />
          <PageRoutes />
          <PageFooter />
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
