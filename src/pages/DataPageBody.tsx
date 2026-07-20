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
    <main className="flex min-w-0 flex-1 flex-col p-4 lg:overflow-hidden">
      <EntityTypeTabs />
      <div className="mb-4 flex w-full shrink-0 flex-wrap items-center justify-between gap-x-2 gap-y-2">
        <div className="flex min-w-0 items-center gap-2">
          <FilterPanelToggle />
          <ResultCount />
          {/* The filter breadcrumb (incl. the "No filters applied" subtitle) is hidden below sm,
              where it only wraps and crowds the toolbar; filters live in the drawer there. */}
          <div className="hidden min-w-0 sm:block">
            <PathContainer>
              <FilterPath />
            </PathContainer>
          </div>
        </div>
        <div className="flex shrink-0 items-center justify-end gap-2">
          <SortPopupCard />
          <ViewSelector />
        </div>
      </div>
      {/* On lg+ only this region scrolls; the tabs and toolbar above stay put. `scrollbar-gutter:
          stable both-edges` reserves the vertical scrollbar's width symmetrically on both sides, so
          centered content (e.g. the Cards grid) keeps equal side gutters whether or not the
          scrollbar is showing, and the layout never jumps as it appears/disappears. Below lg the
          region flows in the natural page scroll instead. */}
      <div className="flex-1 py-2 text-center lg:min-h-0 lg:overflow-auto lg:[scrollbar-gutter:stable_both-edges]">
        <ContainErrorsAndSuspense>
          <DataViews />
        </ContainErrorsAndSuspense>
        <LoadingStageDisplay />
      </div>
    </main>
  );
};

export default DataPageBody;
