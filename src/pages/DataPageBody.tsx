import React, { Suspense } from 'react';

import ViewSelector from '@widgets/controls/selectors/ViewSelector';
import Loading from '@widgets/Loading';
import PathNav from '@widgets/pathnav/PathNav';

import SearchBar from '@features/transforms/search/SearchBar';
import SortBySelector from '@features/transforms/sorting/SortBySelector';

import EntityTypeTabs from './dataviews/EntityTypeTabs';

const DataViews = React.lazy(() => import('./dataviews/DataViews'));

const DataPageBody: React.FC = () => {
  return (
    <main style={{ padding: '1em', flex: 1, overflow: 'auto', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
        <SearchBar />
        <EntityTypeTabs />
      </div>
      <div
        style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', gap: '0.5rem' }}
      >
        <PathNav />
        <SortBySelector showLabel={false} />
        <ViewSelector />
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
