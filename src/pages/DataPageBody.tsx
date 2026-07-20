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
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden p-4">
      <EntityTypeTabs />
      <div className="mb-4 flex w-full shrink-0 items-center justify-between">
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
      {/* Only this region scrolls; the tabs and toolbar above stay put. `scrollbar-gutter: stable
          both-edges` reserves the vertical scrollbar's width symmetrically on both sides, so
          centered content (e.g. the Cards grid) keeps equal side gutters whether or not the
          scrollbar is showing, and the layout never jumps as it appears/disappears. */}
      <div className="min-h-0 flex-1 overflow-auto py-2 text-center [scrollbar-gutter:stable_both-edges]">
        <ContainErrorsAndSuspense>
          <DataViews />
        </ContainErrorsAndSuspense>
        <LoadingStageDisplay />
      </div>
    </main>
  );
};

export default DataPageBody;
