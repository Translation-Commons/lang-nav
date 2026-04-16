import React from 'react';

import FilterPanelProvider from '@widgets/controls/FilterPanelProvider';
import DetailsPanel from '@widgets/details/DetailsPanel';

import ContainErrorsAndSuspense from '@shared/containers/ContainErrorsAndSuspense';

const DataPageBody = React.lazy(() => import('./DataPageBody'));
const OptionsPanel = React.lazy(() => import('@widgets/controls/OptionsPanel'));
const DataPage: React.FC = () => {
  /* Many data components have more lines of code so they are loaded lazily */
  return (
    <ContainErrorsAndSuspense>
      <FilterPanelProvider>
        <div style={{ display: 'flex', height: '100vh' }}>
          <OptionsPanel />
          <DataPageBody />
          <DetailsPanel />
        </div>
      </FilterPanelProvider>
    </ContainErrorsAndSuspense>
  );
};

export default DataPage;
