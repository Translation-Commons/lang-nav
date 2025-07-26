import React, { Suspense } from 'react';

import Loading from './Loading';

const DataProvider = React.lazy(() => import('../data/DataContext'));

const PageBody = React.lazy(() => import('./PageBody'));
const SidePanel = React.lazy(() => import('../controls/SidePanel'));
const ViewModal = React.lazy(() => import('./ViewModal'));

const PageContents: React.FC = () => {
  return (
    // DataProvider and many other data components have more lines of code so they are loaded lazily
    <Suspense fallback={<Loading />}>
      <DataProvider>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <SidePanel />
          <PageBody />
        </div>
      </DataProvider>
      <ViewModal />
    </Suspense>
  );
};

export default PageContents;
