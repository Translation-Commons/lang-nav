import React, { Suspense } from 'react';

import DetailsPanel from '@widgets/details/DetailsPanel';
import Loading from '@widgets/Loading';

import HoverCardProvider from '@features/layers/hovercard/HoverCardProvider';

const DataPageBody = React.lazy(() => import('./DataPageBody'));
const OptionsPanel = React.lazy(() => import('@widgets/controls/OptionsPanel'));
const ViewModal = React.lazy(() => import('@features/layers/modal/ViewModal'));

const DataPage: React.FC = () => {
  /* Many data components have more lines of code so they are loaded lazily */
  return (
    <Suspense fallback={<Loading />}>
      <HoverCardProvider>
        {/* HoverCardProvider is re-declared so it has access to page parameters, there may be a better way to organize it */}
        <div style={{ display: 'flex', height: '100vh' }}>
          <OptionsPanel />
          <DataPageBody />
          <DetailsPanel />
        </div>
        <ViewModal />
      </HoverCardProvider>
    </Suspense>
  );
};

export default DataPage;
