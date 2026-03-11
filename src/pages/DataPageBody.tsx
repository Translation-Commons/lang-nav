import { SlidersHorizontalIcon } from 'lucide-react';
import React, { Suspense } from 'react';

import useFilterPanel from '@widgets/controls/useFilterPanel';
import Loading from '@widgets/Loading';
import PathNav from '@widgets/pathnav/PathNav';

import HoverableButton from '@features/layers/hovercard/HoverableButton';
import ResultCount from '@features/pagination/ResultCount';
import SearchBar from '@features/transforms/search/SearchBar';

import EntityTypeTabs from './dataviews/EntityTypeTabs';

const DataViews = React.lazy(() => import('./dataviews/DataViews'));

const DataPageBody: React.FC = () => {
  const { isOpen, setIsOpen } = useFilterPanel();

  return (
    <main style={{ padding: '1em', flex: 1, overflow: 'auto', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
        <SearchBar />
        <EntityTypeTabs />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
            <HoverableButton
              className={isOpen ? 'selected primary' : 'primary'}
              hoverContent={isOpen ? 'Close filters panel' : 'Open filters panel'}
              onClick={() => setIsOpen((open) => !open)}
              style={{ padding: '0.4em', borderRadius: '0.5em', display: 'flex' }}
              aria-label={isOpen ? 'Close filters panel' : 'Open filters panel'}
            >
              <SlidersHorizontalIcon size="1.2em" />
            </HoverableButton>
            <ResultCount />
          </div>
          <PathNav />
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
