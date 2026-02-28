import React, { Suspense } from 'react';

import DetailsPanel from '@widgets/details/DetailsPanel';
import Loading from '@widgets/Loading';

<<<<<<< HEAD
=======
import HoverCardProvider from '@features/layers/hovercard/HoverCardProvider';

>>>>>>> 8cfeb22 (refactor: move DataProvider to app level with deferred loading)
const DataPageBody = React.lazy(() => import('./DataPageBody'));
const OptionsPanel = React.lazy(() => import('@widgets/controls/OptionsPanel'));
const ViewModal = React.lazy(() => import('@features/layers/modal/ViewModal'));

const DataPage: React.FC = () => {
  /* Many data components have more lines of code so they are loaded lazily */
  return (
    <Suspense fallback={<Loading />}>
<<<<<<< HEAD
      <div style={{ display: 'flex', height: '100vh' }}>
        <OptionsPanel />
        <DataPageBody />
        <DetailsPanel />
      </div>
      <ViewModal />
=======
      <HoverCardProvider>
        {/* HoverCardProvider is re-declared so it has access to page parameters, there may be a better way to organize it */}
        <div style={{ display: 'flex', height: '100vh' }}>
          <OptionsPanel />
          <DataPageBody />
          <DetailsPanel />
        </div>
        <ViewModal />
      </HoverCardProvider>
>>>>>>> 8cfeb22 (refactor: move DataProvider to app level with deferred loading)
    </Suspense>
  );
};

export default DataPage;
