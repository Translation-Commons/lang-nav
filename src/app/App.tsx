import React from 'react';
import { useLocation } from 'react-router-dom';

import PageFooter from '@widgets/PageFooter';
import PageNavBar from '@widgets/PageNavBar';

import ConsentBanner from '@features/consent/ConsentBanner';
import HoverCardProvider from '@features/layers/hovercard/HoverCardProvider';
import PageParamsProvider from '@features/params/PageParamsProvider';

// import { AmplitudeTracker } from './AmplitudeTracker';
import PageRoutes, { LangNavPageName } from './PageRoutes';

// Intro and Data are meant to fit within the viewport, scrolling their own content
// internally, rather than growing the whole document like a normal page of text.
const VIEWPORT_FITTED_PAGES = [LangNavPageName.Intro, LangNavPageName.Data];

const AmplitudeTracker = React.lazy(() => import('./AmplitudeTracker'));

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
            className={
              'flex-1 min-w-0' + (fitsViewport ? ' flex flex-col min-h-0 overflow-auto' : '')
            }
          >
            <PageRoutes />
          </div>

          {/* Footer is in the data content on the data page (rather than being globally set here) */}
          {!location.pathname.includes(LangNavPageName.Data) && <PageFooter />}
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
