import React from 'react';

import PathNav from '@widgets/pathnav/PathNav';

import SearchBar from '@features/transforms/search/SearchBar';

import DataViews from './dataviews/DataViews';

const DataPageBody: React.FC = () => {
  return (
    <main style={{ padding: '1em', flex: 1, overflow: 'auto', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
        <SearchBar />
        <PathNav />
      </div>
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '1rem 2rem',
          textAlign: 'center',
        }}
      >
        <DataViews />
      </div>
    </main>
  );
};

export default DataPageBody;
