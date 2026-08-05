import React from 'react';
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import PageFooter from '@widgets/PageFooter';
import PageNavBar from '@widgets/PageNavBar';

import ConsentBanner from '@features/consent/ConsentBanner';
import useConsent from '@features/consent/useConsent';
import HoverCardProvider from '@features/layers/hovercard/HoverCardProvider';
import PageParamsProvider from '@features/params/PageParamsProvider';
import useAmplitudeParamEvents from '@features/params/useAmplitudeParamEvents';

import { initAmplitude, optOutAmplitude, trackPageView } from '@shared/lib/amplitude';

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

// Intro and Data are meant to fit within the viewport, scrolling their own content
// internally, rather than growing the whole document like a normal page of text.
const VIEWPORT_FITTED_PAGES = [LangNavPageName.Intro, LangNavPageName.Data];

function App() {
  const location = useLocation();
  const fitsViewport = VIEWPORT_FITTED_PAGES.some((page) => location.pathname === `/${page}`);

  return (
    <PageParamsProvider>
      <DeferredDataProvider>
        <HoverCardProvider>
          <AmplitudeTracker />
          <PageNavBar />
          <div
            style={
              fitsViewport
                ? {
                    flex: 1,
                    minWidth: 0,
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'auto',
                  }
                : { flex: 1, minWidth: 0 }
            }
          >
            <PageRoutes />
          </div>
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
