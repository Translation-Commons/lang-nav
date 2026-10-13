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
  return (
    <PageParamsProvider>
      <DeferredDataProvider>
        <HoverCardProvider>
          <AmplitudeTracker />
          <PageNavBar />
          <PageContainer>
            <PageRoutes />
          </PageContainer>
          <FooterOutsideDataPage />
          <ConsentBanner />
        </HoverCardProvider>
      </DeferredDataProvider>
    </PageParamsProvider>
  );
}

// Reads the location here, not in App, so search param changes don't re-render the whole tree.
const PageContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  const fitsViewport = VIEWPORT_FITTED_PAGES.some((page) => pathname === `/${page}`);
  return (
    <div
      className={'flex-1 min-w-0' + (fitsViewport ? ' flex flex-col min-h-0 overflow-auto' : '')}
    >
      {children}
    </div>
  );
};

// Footer is in the data content on the data page (rather than being globally set here)
const FooterOutsideDataPage: React.FC = () => {
  const { pathname } = useLocation();
  return pathname.includes(LangNavPageName.Data) ? null : <PageFooter />;
};

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
