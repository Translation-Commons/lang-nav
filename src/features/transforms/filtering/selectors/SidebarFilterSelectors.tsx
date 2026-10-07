import { ChevronDownIcon } from 'lucide-react';
import React, { useCallback, useState } from 'react';

import usePageParams from '@features/params/usePageParams';
import Field from '@features/transforms/fields/Field';
import {
  FilterField,
  getFilterFields,
  isFieldApplicable,
} from '@features/transforms/fields/FieldApplicability';
import TransformEnum from '@features/transforms/TransformEnum';

import { partition } from '@shared/lib/setUtils';
import { Button } from '@shared/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@shared/ui/hover-card';

import { getFilterTitle } from '../FilterLabels';
import isFilterActive from '../isFilterActive';
import useRemoveFilter from '../useRemoveFilter';

import FilterSelector from './FilterSelector';

/**
 * Limits filters by the ones applicable to the current entity type. For example, if we're
 * looking at censuses, we don't need to show filter for writing system because that does not
 * apply. Censuses would not show the filter for languages because that has not been set up yet.
 */
export const SidebarFilterSelectors: React.FC = () => {
  const params = usePageParams();
  const { entType } = params;
  // All filter fields except for the Name field, which is handled separately.
  const filterFields = getFilterFields().filter((f) => f !== Field.Name);

  const [primaryFilters, otherFilters] = partition(filterFields, (f) =>
    isFieldApplicable(f, TransformEnum.Filter, entType),
  );

  return (
    <div className="flex flex-col gap-4">
      {primaryFilters.map((filterBy) => (
        <SidebarFilterSelector key={filterBy} filterBy={filterBy} />
      ))}
      {otherFilters.length > 0 && (
        <details className="text-xs mt-4">
          <summary>Extra filters</summary>
          Entities shown on the page may be filtered by additional criteria.
          <div className="flex flex-col gap-4">
            {otherFilters.map((filterBy) => (
              <SidebarFilterSelector key={filterBy} filterBy={filterBy} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
};

const SidebarFilterSelector: React.FC<{ filterBy: FilterField }> = ({ filterBy }) => {
  const params = usePageParams();
  const { entType } = params;
  const removeFilter = useRemoveFilter();
  const isActive = isFilterActive(filterBy, params);
  const [isExpanded, setIsExpanded] = useState(true);
  const toggleExpanded = () => setIsExpanded((prev) => !prev);
  const remove = useCallback(() => removeFilter(filterBy), [removeFilter, filterBy]);

  return (
    <div>
      <div
        className="flex items-center justify-between py-1 px-2 gap-1 w-full hover:bg-gray-100 cursor-pointer rounded-md"
        onClick={toggleExpanded}
      >
        {getFilterTitle(filterBy, entType)}
        <div className="flex items-center gap-1">
          {isActive && (
            <HoverCard>
              <HoverCardTrigger
                delay={100}
                render={
                  <Button onClick={remove} size="sm" variant="active">
                    active
                  </Button>
                }
              />
              <HoverCardContent className="w-fit">Click to remove filter</HoverCardContent>
            </HoverCard>
          )}
          <Button size="icon-sm" variant="ghost">
            <ChevronDownIcon className={`transition-transform ${isExpanded ? '' : 'rotate-90'}`} />
          </Button>
        </div>
      </div>
      <div
        className={`transition-[max-height] px-2 duration-300 overflow-hidden ${isExpanded ? 'max-h-36' : 'max-h-0'}`}
      >
        <FilterSelector field={filterBy} />
      </div>
    </div>
  );
};

export default SidebarFilterSelectors;
