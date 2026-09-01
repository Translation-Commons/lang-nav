import React from 'react';

import FilterPanelProvider from '@widgets/controls/FilterPanelProvider';

import ContainErrorsAndSuspense from '@shared/containers/ContainErrorsAndSuspense';

const DataPageBody = React.lazy(() => import('./DataPageBody'));
const FilterPanel = React.lazy(() => import('@widgets/controls/FilterPanel'));
const EntityDetailsDrawer = React.lazy(() => import('@widgets/details/ui/EntityDetailsDrawer'));

const DataPage: React.FC = () => {
  /* Many data components have more lines of code so they are loaded lazily */
  return (
    <ContainErrorsAndSuspense>
      <FilterPanelProvider>
        <div style={{ display: 'flex', alignItems: 'flex-start', height: '100%' }}>
          <FilterPanel />
          <DataPageBody />
          <EntityDetailsDrawer />
        </div>
      </FilterPanelProvider>
    </ContainErrorsAndSuspense>
  );
};

export default DataPage;
