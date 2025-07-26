import React from 'react';

import SearchBar from '../controls/selectors/SearchBar';

import MainViews from './MainViews';

const PageBody: React.FC = () => {
  return (
    <main style={{ padding: '1em', flex: 1, overflow: 'auto', width: '100%' }}>
      <SearchBar />
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '1rem 2rem',
          textAlign: 'center',
        }}
      >
        <MainViews />
      </div>
    </main>
  );
};

export default PageBody;
