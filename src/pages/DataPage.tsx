import React, { Suspense } from 'react';

import FilterPanelProvider from '@widgets/controls/FilterPanelProvider';
import DetailsPanel from '@widgets/details/DetailsPanel';
import Loading from '@widgets/Loading';

const DataPageBody = React.lazy(() => import('./DataPageBody'));
const OptionsPanel = React.lazy(() => import('@widgets/controls/OptionsPanel'));
const DataPage: React.FC = () => {
  /* Many data components have more lines of code so they are loaded lazily */
  return (
    <Suspense fallback={<Loading />}>
      <FilterPanelProvider>
        <div style={{ display: 'flex', height: '100vh' }}>
          <OptionsPanel />
          <DataPageBody />
          <DetailsPanel />
        </div>
      </FilterPanelProvider>
    </Suspense>
  );
};

export default DataPage;
