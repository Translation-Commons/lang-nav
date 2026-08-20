import React from 'react';

import FilterPanelProvider from '@widgets/controls/FilterPanelProvider';

import ContainErrorsAndSuspense from '@shared/containers/ContainErrorsAndSuspense';

const DataPageBody = React.lazy(() => import('./DataPageBody'));
const FilterPanel = React.lazy(() => import('@widgets/controls/FilterPanel'));
const DetailsPanel = React.lazy(() => import('@widgets/details/ui/DetailsPanel'));

const DataPage: React.FC = () => {
  /* Many data components have more lines of code so they are loaded lazily */
  return (
    <ContainErrorsAndSuspense>
      <FilterPanelProvider>
        <div style={{ display: 'flex', alignItems: 'flex-start', height: '100%' }}>
          <FilterPanel />
          <DataPageBody />
          <DetailsPanel />
        </div>
      </FilterPanelProvider>
    </ContainErrorsAndSuspense>
  );
};

export default DataPage;
