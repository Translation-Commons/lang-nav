import { FilterIcon, PanelLeftIcon } from 'lucide-react';
import React from 'react';

import ViewSelector from '@widgets/controls/selectors/ViewSelector';
import ReportSelector from '@widgets/reports/ReportSelector';

import usePageParams from '@features/params/usePageParams';
import ColorPopupCard from '@features/transforms/coloring/ColorPopupCard';
import { getFilterFields, isFieldApplicable } from '@features/transforms/fields/FieldApplicability';
import FieldFocusSelector from '@features/transforms/fields/FieldFocusSelector';
import FilterBreakdown from '@features/transforms/filtering/FilterBreakdown';
import isFilterActive from '@features/transforms/filtering/isFilterActive';
import SubstringFilterSelector from '@features/transforms/filtering/selectors/SubstringFilterSelector';
import useFilteredEntities from '@features/transforms/filtering/useFilteredEntities';
import ScalePopupCard from '@features/transforms/scales/ScalePopupCard';
import SortPopupCard from '@features/transforms/sorting/SortPopupCard';
import TransformEnum from '@features/transforms/TransformEnum';

import { Badge } from '@shared/ui/badge';
import { Button } from '@shared/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/ui/popover';
import { Toggle } from '@shared/ui/toggle';

import EntityTypeTabs from './dataviews/EntityTypeTabs';
import LanguageFocusTabs from './dataviews/LanguageFocusTabs';

type Props = {
  sidebarIsOpen: boolean;
  toggleSidebar: () => void;
};

const DataPageHeader: React.FC<Props> = ({ sidebarIsOpen, toggleSidebar }) => {
  const params = usePageParams();
  const { filteredEntities, allEntities } = useFilteredEntities({});
  const activeFilters = getFilterFields().filter(
    (f) => isFilterActive(f, params) && isFieldApplicable(f, TransformEnum.Filter, params.entType),
  );

  return (
    <div>
      <EntityTypeTabs />
      <LanguageFocusTabs />
      <div className="flex items-center justify-between w-full mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Popover>
            <PopoverTrigger
              render={
                <Button variant="outline">
                  <FilterIcon />
                  filters
                  <Badge variant={activeFilters.length > 0 ? 'default' : 'outline'}>
                    {activeFilters.length.toLocaleString()}
                  </Badge>
                </Button>
              }
            />
            <PopoverContent className="w-fit">
              <Toggle pressed={sidebarIsOpen} onPressedChange={toggleSidebar}>
                <PanelLeftIcon />
                show in sidebar
              </Toggle>
              <FilterBreakdown ents={allEntities} />
            </PopoverContent>
          </Popover>
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
