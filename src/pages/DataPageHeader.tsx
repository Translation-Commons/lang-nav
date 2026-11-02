import React from 'react';

import ViewSelector from '@widgets/controls/selectors/ViewSelector';
import ReportSelector from '@widgets/reports/ReportSelector';

import ColorPopupCard from '@features/transforms/coloring/ColorPopupCard';
import FieldFocusSelector from '@features/transforms/fields/FieldFocusSelector';
import FiltersPopover from '@features/transforms/filtering/FiltersPopover';
import SubstringFilterSelector from '@features/transforms/filtering/selectors/SubstringFilterSelector';
import useFilteredEntities from '@features/transforms/filtering/useFilteredEntities';
import ScalePopupCard from '@features/transforms/scales/ScalePopupCard';
import SortPopupCard from '@features/transforms/sorting/SortPopupCard';

import EntityTypeTabs from './dataviews/EntityTypeTabs';
import LanguageFocusTabs from './dataviews/LanguageFocusTabs';

const DataPageHeader: React.FC = () => {
  const { filteredEntities } = useFilteredEntities({});

  return (
    <div className="flex flex-col gap-1">
      <EntityTypeTabs />
      <LanguageFocusTabs />
      <div className="flex items-center justify-between w-full mb-4 flex-wrap gap-1">
        <div className="flex items-center gap-2 text-sm min-w-100">
          <FiltersPopover />
          <div className="text-nowrap">{filteredEntities.length.toLocaleString()} Results</div>
          <SubstringFilterSelector />
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
    </div>
  );
};

export default DataPageHeader;
