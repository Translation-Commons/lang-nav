import React from 'react';

import PageFooter from '@widgets/PageFooter';
import PageNavBar from '@widgets/PageNavBar';

import HoverCardProvider from '@features/layers/hovercard/HoverCardProvider';

import PageRoutes from './PageRoutes';

import './index.css';

function App() {
  return (
    <DeferredDataProviders>
      <HoverCardProvider>
        <PageNavBar />
        <PageRoutes />
        <PageFooter />
      </HoverCardProvider>
    </DeferredDataProviders>
  );
}

const DeferredDataProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [PageParamsProvider, setPageParamsProvider] = React.useState<
    React.ComponentType<{ children: React.ReactNode }> | undefined
  >(undefined);
  const [DataProvider, setDataProvider] = React.useState<
    React.ComponentType<{ children: React.ReactNode }> | undefined
  >(undefined);

  React.useEffect(() => {
    import('@features/params/PageParamsProvider').then((m) =>
      setPageParamsProvider(() => m.default),
    );
    import('@features/data/context/DataProvider').then((m) => setDataProvider(() => m.default));
  }, []);
  if (!PageParamsProvider || !DataProvider) return null;

  return (
    <PageParamsProvider>
      <DataProvider>{children}</DataProvider>
    </PageParamsProvider>
  );
};

export default App;
