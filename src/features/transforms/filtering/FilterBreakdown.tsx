import { ChevronDownIcon } from 'lucide-react';
import React, { useMemo } from 'react';

import usePageParams from '@features/params/usePageParams';

import { getEntityTypeLabelPlural } from '@entities/lib/getEntityName';
import { EntityData } from '@entities/types/EntityTypes';

import { partition } from '@shared/lib/setUtils';
import { cn } from '@shared/lib/utils';
import { Toggle } from '@shared/ui/toggle';

import Field from '../fields/Field';
import { FilterField, isFieldApplicable } from '../fields/FieldApplicability';
import TransformEnum from '../TransformEnum';

import FilterButton from './FilterButton';
import isFilterActive from './isFilterActive';
import useFilters from './useFilters';

type FilterExplanationProps = {
  ents: EntityData[];
  shouldFilterUsingSearchBar?: boolean;
};

const filterOrder: FilterField[] = [
  Field.SourceForLanguage,
  Field.LanguageScope,
  Field.Modality,
  Field.TerritoryScope,
  Field.TerritoryList,
  Field.WritingSystem,
  Field.LanguageFamily,
  Field.LanguageList,
  Field.ISOStatus,
  Field.Population,
  Field.Organization,
  Field.Name,
];

type FieldFilterCounts = {
  field: FilterField;
  nPassed: number;
  nFiltered: number;
};

const FilterBreakdown: React.FC<FilterExplanationProps> = ({
  ents,
  shouldFilterUsingSearchBar = true,
}) => {
  const params = usePageParams();
  const filterBy = useFilters();
  const nOverall = ents.length;
  const [showPotentialFilters, setShowPotentialFilters] = React.useState(false);

  const filterCounts = useMemo(
    () =>
      filterOrder.reduce(
        ({ ents, counts }, field) => {
          if (field === Field.Name && !shouldFilterUsingSearchBar) return { ents, counts };

          const filtered = ents.filter(filterBy[field]);
          const nPassed = filtered.length;
          const nFiltered = ents.length - nPassed;
          counts[field] = { field, nPassed, nFiltered };
          return { ents: filtered, counts };
        },
        { ents, counts: {} as Record<FilterField, FieldFilterCounts> },
      ).counts,
    [ents, filterBy, shouldFilterUsingSearchBar],
  );
  const entType = useMemo(() => ents[0]?.type ?? params.entType, [ents, params.entType]);

  const [activeFilters, potentialFilters] = partition(
    filterOrder.filter((field) => isFieldApplicable(field, TransformEnum.Filter, entType)),
    (field) => isFilterActive(field, params),
  );

  return (
    <div className="flex flex-col gap-1 text-left">
      <div className="flex flex-row gap-1 items-center justify-between">
        <div>All {getEntityTypeLabelPlural(entType, true)}</div>
        <div className="count">{nOverall.toLocaleString()}</div>
      </div>
      {activeFilters.map((field) => (
        <div className="flex flex-row gap-1 items-center justify-between" key={field}>
          <FilterButton field={field} data-testid="FilterButton" />
          <div className="count text-right">{filterCounts[field]?.nPassed.toLocaleString()}</div>
        </div>
      ))}
      <div className="text-center">
        <Toggle
          pressed={showPotentialFilters}
          onPressedChange={() => setShowPotentialFilters(!showPotentialFilters)}
        >
          more filters <ChevronDownIcon />
        </Toggle>
      </div>
      <div
        className={cn(
          'transition-all duration-300',
          showPotentialFilters ? 'flex flex-col gap-1 text-left' : 'hidden',
        )}
      >
        {potentialFilters.map((field) => (
          <div key={field}>
            <FilterButton field={field} data-testid="FilterButton" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterBreakdown;
