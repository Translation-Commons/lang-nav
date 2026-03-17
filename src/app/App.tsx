import React from 'react';

import PageFooter from '@widgets/PageFooter';
import PageNavBar from '@widgets/PageNavBar';

import HoverCardProvider from '@features/layers/hovercard/HoverCardProvider';
import PageParamsProvider from '@features/params/PageParamsProvider';

import PageRoutes from './PageRoutes';

import './index.css';

function App() {
  return (
    <PageParamsProvider>
      <DeferredDataProvider>
        <HoverCardProvider>
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
