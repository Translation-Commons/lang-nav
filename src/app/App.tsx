import React from 'react';
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import PageFooter from '@widgets/PageFooter';
import PageNavBar from '@widgets/PageNavBar';

import ConsentBanner from '@features/consent/ConsentBanner';
import useConsent from '@features/consent/useConsent';
import PageParamsProvider from '@features/params/PageParamsProvider';
import useAmplitudeParamEvents from '@features/params/useAmplitudeParamEvents';

import { initAmplitude, optOutAmplitude, trackPageView } from '@shared/lib/amplitude';
import { cn } from '@shared/lib/utils';
import { TooltipProvider } from '@shared/ui/tooltip';

import PageRoutes, { LangNavPageName } from './PageRoutes';

function AmplitudeTracker() {
  const location = useLocation();
  const lastPathnameRef = useRef('');
  const { state } = useConsent();
  const analyticsConsent = state?.analytics === 'granted';

  useAmplitudeParamEvents();

  useEffect(() => {
    if (!analyticsConsent) {
      // User withdrew consent (or never granted it): clear any in-memory
      // identity so the currently-loaded SDK instance can't keep tracking.
      optOutAmplitude();
      return;
    }

    initAmplitude();

    if (lastPathnameRef.current === location.pathname) return;

    lastPathnameRef.current = location.pathname;
    trackPageView(location.pathname, location.search);
  }, [analyticsConsent, location.pathname, location.search]);

  return null;
}

function App() {
  const location = useLocation();
  // On lg+ the Data page is a fixed-height app shell: its interior view scrolls, the page does not.
  // Below lg (and on every other page) the shell keeps the natural min-height document flow so the
  // whole page scrolls and the footer flows after the content.
  const isDataPage = location.pathname.replace(/\/+$/, '') === '/' + LangNavPageName.Data;

  return (
    <TooltipProvider delay={300}>
      <PageParamsProvider>
        <DeferredDataProvider>
          <div
            className={cn(
              'flex min-h-screen flex-col',
              isDataPage && 'lg:h-dvh lg:min-h-0 lg:overflow-hidden',
            )}
          >
            <AmplitudeTracker />
            <PageNavBar />
            <div className={cn('flex min-w-0 flex-1 flex-col', isDataPage && 'lg:min-h-0')}>
              <PageRoutes />
            </div>
            <PageFooter />
            <ConsentBanner />
          </div>
        </DeferredDataProvider>
      </PageParamsProvider>
    </TooltipProvider>
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
