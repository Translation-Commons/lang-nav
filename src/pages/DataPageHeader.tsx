import { FilterIcon } from 'lucide-react';
import React from 'react';

import ViewSelector from '@widgets/controls/selectors/ViewSelector';
import ReportSelector from '@widgets/reports/ReportSelector';

import usePageParams from '@features/params/usePageParams';
import ColorPopupCard from '@features/transforms/coloring/ColorPopupCard';
import { getFilterFields, isFieldApplicable } from '@features/transforms/fields/FieldApplicability';
import FieldFocusSelector from '@features/transforms/fields/FieldFocusSelector';
import ActiveFilterButtons from '@features/transforms/filtering/ActiveFilterButtons';
import isFilterActive from '@features/transforms/filtering/isFilterActive';
import useFilteredEntities from '@features/transforms/filtering/useFilteredEntities';
import ScalePopupCard from '@features/transforms/scales/ScalePopupCard';
import SortPopupCard from '@features/transforms/sorting/SortPopupCard';
import TransformEnum from '@features/transforms/TransformEnum';

import { Badge } from '@shared/ui/badge';
import { Button } from '@shared/ui/button';

import EntityTypeTabs from './dataviews/EntityTypeTabs';
import LanguageFocusTabs from './dataviews/LanguageFocusTabs';

type Props = {
  sidebarIsOpen: boolean;
  toggleSidebar: () => void;
};

const DataPageHeader: React.FC<Props> = ({ sidebarIsOpen, toggleSidebar }) => {
  const params = usePageParams();
  const { filteredEntities } = useFilteredEntities({});
  const activeFilters = getFilterFields().filter(
    (f) => isFilterActive(f, params) && isFieldApplicable(f, TransformEnum.Filter, params.entType),
  );

  return (
    <div>
      <EntityTypeTabs />
      <LanguageFocusTabs />
      <div className="flex items-center justify-between w-full mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Button variant={sidebarIsOpen ? 'active' : 'outline'} onClick={toggleSidebar}>
            <FilterIcon />
            filters
            <Badge>{activeFilters.length.toLocaleString()}</Badge>
          </Button>
          {filteredEntities.length.toLocaleString()} Results
          <ActiveFilterButtons />
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
