import React, { useMemo } from 'react';

import usePageParams from '@features/page-params/usePageParams';

import { ObjectData } from '@entities/types/DataTypes';

import {
  getFilterBySubstring,
  getFilterByTerritory,
  getFilterByVitality,
  getScopeFilter,
} from './filter';

type FilterExplanationProps = {
  objects: ObjectData[];
  shouldFilterUsingSearchBar?: boolean;
};

const FilterBreakdown: React.FC<FilterExplanationProps> = ({
  objects,
  shouldFilterUsingSearchBar,
}) => {
  const { territoryFilter } = usePageParams();
  const filterBySubstring = shouldFilterUsingSearchBar ? getFilterBySubstring() : () => true;
  const filterByTerritory = getFilterByTerritory();
  const filterByScope = getScopeFilter();
  const filterByVitality = getFilterByVitality();

  const [nInScope, nInTerritory, nInVitality, nMatchingSubstring] = useMemo(() => {
    const filteredByScope = objects.filter(filterByScope);
    const filteredByTerritory = filteredByScope.filter(filterByTerritory);
    const filteredByVitality = filteredByTerritory.filter(filterByVitality);
    const filteredBySubstring = filteredByVitality.filter(filterBySubstring);
    return [
      filteredByScope.length,
      filteredByTerritory.length,
      filteredByVitality.length,
      filteredBySubstring.length,
    ];
  }, [objects, filterByScope, filterByTerritory, filterByVitality, filterBySubstring]);

  const nOverall = objects.length;
  const nFilteredByScope = nOverall - nInScope;
  const nFilteredByTerritory = nInScope - nInTerritory;
  const nFilteredByVitality = nInTerritory - nInVitality;
  const nFilteredBySubstring = nInVitality - nMatchingSubstring;
  if (nOverall === 0) {
    return 'Data is still loading. If you are waiting awhile there could be an error in the data.';
  }

  return (
    <>
      {nFilteredByScope > 0 && <div>Out of scope: {nFilteredByScope.toLocaleString()}</div>}
      {nFilteredByTerritory > 0 && (
        <div>
          Not in territory ({territoryFilter}): {nFilteredByTerritory.toLocaleString()}
        </div>
      )}
      {nFilteredByVitality > 0 && (
        <div>Not passing vitality filter: {nFilteredByVitality.toLocaleString()}</div>
      )}
      {nFilteredBySubstring > 0 && (
        <div>Not matching substring: {nFilteredBySubstring.toLocaleString()}</div>
      )}
    </>
  );
};

export default FilterBreakdown;
