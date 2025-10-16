import React from 'react';

import SearchBar from '@widgets/controls/selectors/SearchBar';
import PathNav from '@widgets/pathnav/PathNav';

import DataViews from './DataViews';

const DataPageBody: React.FC = () => {
  return (
    <main style={{ padding: '1em', flex: 1, overflow: 'auto', width: '100%' }}>
      <SearchBar />
      <PathNav />
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
