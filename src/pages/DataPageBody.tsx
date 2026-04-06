import React, { Suspense } from 'react';

import FilterPanelToggle from '@widgets/controls/FilterPanelToggle';
import ViewSelector from '@widgets/controls/selectors/ViewSelector';
import Loading from '@widgets/Loading';
import { PathContainer } from '@widgets/pathnav/PathNav';

import ResultCount from '@features/pagination/ResultCount';
import FilterPath from '@features/transforms/filtering/FilterPath';
import SortBySelector from '@features/transforms/sorting/SortBySelector';

import EntityTypeTabs from './dataviews/EntityTypeTabs';

const DataViews = React.lazy(() => import('./dataviews/DataViews'));

const DataPageBody: React.FC = () => {
  return (
    <main style={{ padding: '1em', flex: 1, overflow: 'auto', width: '100%' }}>
      <EntityTypeTabs />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
          <FilterPanelToggle />
          <ResultCount />
          <PathContainer>
            <FilterPath />
          </PathContainer>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.5rem',
          }}
        >
          <SortBySelector showLabel={false} />
          <ViewSelector />
        </div>
      </div>
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '1rem 2rem',
          textAlign: 'center',
        }}
      >
        <Suspense fallback={<Loading />}>
          <DataViews />
        </Suspense>
      </div>
    </main>
  );
};

export default DataPageBody;
