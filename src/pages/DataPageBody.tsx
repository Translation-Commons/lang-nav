import React from 'react';

import FilterPanelToggle from '@widgets/controls/FilterPanelToggle';
import ViewSelector from '@widgets/controls/selectors/ViewSelector';
import { PathContainer } from '@widgets/pathnav/PathNav';

import LoadingStageDisplay from '@features/data/context/LoadingStageDisplay';
import ResultCount from '@features/pagination/ResultCount';
import ColorPopupCard from '@features/transforms/coloring/ColorPopupCard';
import FilterPath from '@features/transforms/filtering/FilterPath';
import ScalePopupCard from '@features/transforms/scales/ScalePopupCard';
import SortPopupCard from '@features/transforms/sorting/SortPopupCard';

import ContainErrorsAndSuspense from '@shared/containers/ContainErrorsAndSuspense';

import EntityTypeTabs from './dataviews/EntityTypeTabs';
import LanguageFocusTabs from './dataviews/LanguageFocusTabs';

import './datapage.css';

const DataViews = React.lazy(() => import('./dataviews/DataViews'));

const DataPageBody: React.FC = () => {
  return (
    <main className="DataPageBody">
      <EntityTypeTabs />
      <LanguageFocusTabs />
      <div className="DataPageBodyResultCountAndViewOptions">
        <div className="DataPageBodyResultCount">
          <FilterPanelToggle />
          <ResultCount />
          <PathContainer>
            <FilterPath />
          </PathContainer>
        </div>
        <div className="DataPageBodyViewOptions">
          <ScalePopupCard />
          <ColorPopupCard />
          <SortPopupCard />
          <ViewSelector />
        </div>
      </div>
      <div className="DataPageBodyContents">
        <ContainErrorsAndSuspense>
          <DataViews />
        </ContainErrorsAndSuspense>
      </div>
      <LoadingStageDisplay />
    </main>
  );
};

export default DataPageBody;
