import { XIcon } from 'lucide-react';
import React, { useMemo } from 'react';

import HoverableButton from '@features/layers/hovercard/HoverableButton';

import { getEntityTypeLabelPlural } from '@entities/lib/getEntityName';
import { EntityData, EntityType } from '@entities/types/EntityTypes';

import { getFieldLabel } from '@strings/FieldLabelStrings';

import Field from '../fields/Field';

import { useFilterLabels } from './FilterLabels';
import useFilters from './useFilters';
import useRemoveFilter from './useRemoveFilter';

type FilterExplanationProps = {
  ents: EntityData[];
  shouldFilterUsingSearchBar?: boolean;
};

const filterOrder: Field[] = [
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
  field: Field;
  nPassed: number;
  nFiltered: number;
};

const FilterBreakdown: React.FC<FilterExplanationProps> = ({
  ents,
  shouldFilterUsingSearchBar = true,
}) => {
  const filterBy = useFilters();
  const nOverall = ents.length;
  const entType = ents[0]?.type ?? EntityType.Language;
  const removeFilter = useRemoveFilter();
  const filterLabels = useFilterLabels();

  const filterCounts = useMemo(
    () =>
      filterOrder.reduce(
        ({ ents, counts }, field) => {
          const filtered = ents.filter(filterBy[field]);
          const nPassed = filtered.length;
          const nFiltered = ents.length - nPassed;
          counts.push({ field, nPassed, nFiltered });
          return { ents: filtered, counts };
        },
        { ents, counts: [] as FieldFilterCounts[] },
      ).counts,
    [ents, filterBy],
  );
  const nPassedAll = filterCounts[filterCounts.length - 1]?.nPassed;

  // Return an empty component if nothing was filtered
  if (nOverall === nPassedAll) return null;

  return (
    <table style={{ textAlign: 'left' }}>
      <tbody>
        <tr>
          <td>All {getEntityTypeLabelPlural(ents[0].type)}</td>
          <td className="count">{nOverall.toLocaleString()}</td>
        </tr>
        {filterCounts.map(
          ({ field, nFiltered }) =>
            nFiltered > 0 && (
              <tr key={field}>
                <td>Not {filterLabels[field]}</td>
                <td className="count">{(nFiltered * -1).toLocaleString()}</td>
                <td>
                  <HoverableButton
                    buttonType="reset"
                    hoverContent={`Clear the ${getFieldLabel(field, entType)} filter`}
                    onClick={() => removeFilter(field)}
                    style={{ padding: '0.25em', marginLeft: '0.25em' }}
                  >
                    <XIcon size="1em" display="block" />
                  </HoverableButton>
                </td>
              </tr>
            ),
        )}
        <tr>
          <td style={{ fontWeight: 'bold', borderTop: '2px solid var(--color-button-primary)' }}>
            Results
          </td>
          <td className="count" style={{ borderTop: '2px solid var(--color-button-primary)' }}>
            {nPassedAll.toLocaleString()}
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default FilterBreakdown;
