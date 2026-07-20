import React from 'react';

import FilterPanelToggle from '@widgets/controls/FilterPanelToggle';
import ViewSelector from '@widgets/controls/selectors/ViewSelector';
import { PathContainer } from '@widgets/pathnav/PathNav';

import LoadingStageDisplay from '@features/data/context/LoadingStageDisplay';
import ResultCount from '@features/pagination/ResultCount';
import FilterPath from '@features/transforms/filtering/FilterPath';
import SortPopupCard from '@features/transforms/sorting/SortPopupCard';

import ContainErrorsAndSuspense from '@shared/containers/ContainErrorsAndSuspense';

import EntityTypeTabs from './dataviews/EntityTypeTabs';

const DataViews = React.lazy(() => import('./dataviews/DataViews'));

const DataPageBody: React.FC = () => {
  return (
    <main className="w-full flex-1 overflow-auto p-4">
      <EntityTypeTabs />
      <div className="mb-4 flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <FilterPanelToggle />
          <ResultCount />
          <PathContainer>
            <FilterPath />
          </PathContainer>
        </div>
        <div className="flex items-center justify-end gap-2">
          <SortPopupCard />
          <ViewSelector />
        </div>
      </div>
      <div className="mx-auto max-w-[1280px] px-8 py-4 text-center">
        <ContainErrorsAndSuspense>
          <DataViews />
        </ContainErrorsAndSuspense>
      </div>
      <LoadingStageDisplay />
    </main>
  );
};

export default DataPageBody;
