import { FilterIcon } from 'lucide-react';

import { useDataVizParams } from '@features/params/DataVizParamsProvider';
import usePageParams from '@features/params/usePageParams';

import { Badge } from '@shared/ui/badge';
import { Button } from '@shared/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/ui/popover';
import { Toggle } from '@shared/ui/toggle';

import { getFilterFields, isFieldApplicable } from '../fields/FieldApplicability';
import TransformEnum from '../TransformEnum';

import FilterBreakdown from './FilterBreakdown';
import isFilterActive from './isFilterActive';
import useFilteredEntities from './useFilteredEntities';

const FiltersPopover: React.FC = () => {
  const params = usePageParams();
  const { allEntities } = useFilteredEntities({});
  const { isFilterPanelOpen, toggleFilterPanel } = useDataVizParams();
  const activeFilters = getFilterFields().filter(
    (f) => isFilterActive(f, params) && isFieldApplicable(f, TransformEnum.Filter, params.entType),
  );

  return (
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
        {params.paramsLevel === 'global' && (
          <Toggle pressed={isFilterPanelOpen} onPressedChange={toggleFilterPanel}>
            <FilterIcon />
            show in sidebar
          </Toggle>
        )}
        <FilterBreakdown ents={allEntities} />
      </PopoverContent>
    </Popover>
  );
};

export default FiltersPopover;
