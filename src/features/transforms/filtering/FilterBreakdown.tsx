import React, { useMemo } from 'react';

import { getEntityTypeLabelPlural } from '@entities/lib/getEntityName';
import { EntityData } from '@entities/types/EntityTypes';

import Field from '../fields/Field';
import { FilterField } from '../fields/FieldApplicability';

import FilterButton from './FilterButton';
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
  const filterBy = useFilters();
  const nOverall = ents.length;

  const filterCounts = useMemo(
    () =>
      filterOrder.reduce(
        ({ ents, counts }, field) => {
          if (field === Field.Name && !shouldFilterUsingSearchBar) return { ents, counts };

          const filtered = ents.filter(filterBy[field]);
          const nPassed = filtered.length;
          const nFiltered = ents.length - nPassed;
          counts.push({ field, nPassed, nFiltered });
          return { ents: filtered, counts };
        },
        { ents, counts: [] as FieldFilterCounts[] },
      ).counts,
    [ents, filterBy, shouldFilterUsingSearchBar],
  );
  const nPassedAll = filterCounts[filterCounts.length - 1]?.nPassed ?? nOverall;

  // Return an empty component if nothing was filtered
  if (nOverall === nPassedAll) return null;

  return (
    <table className="text-left">
      <tbody>
        <tr>
          <td>All {getEntityTypeLabelPlural(ents[0].type)}</td>
          <td className="count">{nOverall.toLocaleString()}</td>
        </tr>
        {filterCounts.map(
          ({ field, nFiltered }) =>
            nFiltered > 0 && (
              <tr key={field}>
                <td>
                  <div className="flex flex-nowrap gap-1 items-center">
                    Not <FilterButton field={field} />
                  </div>
                </td>
                <td className="count">{(nFiltered * -1).toLocaleString()}</td>
              </tr>
            ),
        )}
        <tr>
          <td className="font-bold border-t-2">Results</td>
          <td className="count border-t-2">{nPassedAll.toLocaleString()}</td>
        </tr>
      </tbody>
    </table>
  );
};

export default FilterBreakdown;
