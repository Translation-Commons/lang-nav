import React, { Suspense } from 'react';

import Loading from '@widgets/Loading';

import HoverCardProvider from '@features/hovercard/HoverCardProvider';

const PageParamsProvider = React.lazy(() => import('@features/page-params/PageParamsProvider'));
const DataProvider = React.lazy(() => import('@features/data-loading/context/DataProvider'));
const DataPageBody = React.lazy(() => import('./DataPageBody'));
const SidePanel = React.lazy(() => import('@widgets/controls/SidePanel'));
const ViewModal = React.lazy(() => import('@features/modal/ViewModal'));

const DataPage: React.FC = () => {
  /* DataProvider and many other data components have more lines of code so they are loaded lazily */
  return (
    <Suspense fallback={<Loading />}>
      <PageParamsProvider>
        <HoverCardProvider>
          {/* HoverCardProvider is re-declared so it has access to page parameters, there may be a better way to organize it */}
          <DataProvider>
            <div style={{ display: 'flex', height: '100vh' }}>
              <SidePanel />
              <DataPageBody />
            </div>
            <ViewModal />
          </DataProvider>
        </HoverCardProvider>
      </PageParamsProvider>
    </Suspense>
  );
};

export default DataPage;
