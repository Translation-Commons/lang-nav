import React from 'react';

import PathNav from '../controls/pathnav/PathNav';
import SearchBar from '../controls/selectors/SearchBar';

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
