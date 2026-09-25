import { PlusIcon } from 'lucide-react';
import React from 'react';

import ViewSelector from '@widgets/controls/selectors/ViewSelector';
import PageFooter from '@widgets/PageFooter';
import ReportSelector from '@widgets/reports/ReportSelector';

import LoadingStageDisplay from '@features/data/context/LoadingStageDisplay';
import ResultCount from '@features/pagination/ResultCount';
import ColorPopupCard from '@features/transforms/coloring/ColorPopupCard';
import FieldFocusSelector from '@features/transforms/fields/FieldFocusSelector';
import FilterPath from '@features/transforms/filtering/FilterPath';
import ScalePopupCard from '@features/transforms/scales/ScalePopupCard';
import SortPopupCard from '@features/transforms/sorting/SortPopupCard';

import ContainErrorsAndSuspense from '@shared/containers/ContainErrorsAndSuspense';
import { Button } from '@shared/ui/button';

import EntityTypeTabs from './dataviews/EntityTypeTabs';
import LanguageFocusTabs from './dataviews/LanguageFocusTabs';

const DataViews = React.lazy(() => import('./dataviews/DataViews'));

type Props = {
  sidebarIsOpen: boolean;
  openSidebar: () => void;
};

const DataPageBody: React.FC<Props> = ({ sidebarIsOpen, openSidebar }) => {
  return (
    <div className="flex-1 w-full h-full overflow-auto">
      <main className="px-4 py-2 ">
        <EntityTypeTabs />
        <LanguageFocusTabs />
        <div className="flex items-center justify-between w-full mb-4">
          <div className="flex items-center gap-2 text-sm">
            <ResultCount />
            <FilterPath />
            {!sidebarIsOpen && (
              <Button variant="outline" style={{ padding: '0.25em' }} onClick={openSidebar}>
                <PlusIcon />
                filters
              </Button>
            )}
          </div>
          <div className="flex items-center justify-end gap-2">
            <ReportSelector variant="Dropdown" />
            <FieldFocusSelector />
            <ScalePopupCard />
            <ColorPopupCard />
            <SortPopupCard />
            <ViewSelector />
          </div>
        </div>
        <div className="max-w-5xl mx-auto p-4 text-center">
          <ContainErrorsAndSuspense>
            <DataViews />
          </ContainErrorsAndSuspense>
        </div>
        <LoadingStageDisplay />
      </main>
      <PageFooter />
    </div>
  );
};

export default DataPageBody;
