import React, { Suspense } from 'react';

import { HoverCardProvider } from '../generic/HoverCardContext';
import Loading from '../views/Loading';

const PageParamsProvider = React.lazy(() => import('../controls/PageParamsContext'));
const DataProvider = React.lazy(() => import('../data/DataContext'));
const DataPageBody = React.lazy(() => import('../views/DataPageBody'));
const SidePanel = React.lazy(() => import('../controls/SidePanel'));
const ViewModal = React.lazy(() => import('../views/ViewModal'));

const DataPage: React.FC = () => {
  /* DataProvider and many other data components have more lines of code so they are loaded lazily */
  return (
    <Suspense fallback={<Loading />}>
      <PageParamsProvider>
        <HoverCardProvider>
          {/* HoverCardProvider is re-declared so it has access to page parameters, there may be a better way to organize it */}
          <DataProvider>
            <div style={{ display: 'flex', minHeight: '100vh' }}>
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
