import React, { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import { PageParamKey } from '@features/params/PageParamTypes';

import { TerritoryData } from '@entities/territory/TerritoryTypes';

import { sortByPopulation } from '../../sorting/sort';
import { getScopeFilter } from '../filter';
import { getFilterLabels } from '../FilterLabels';
import { getSuggestionsFunction } from '../getSuggestionsFunction';

import EntityFilterSelector from './EntityFilterSelector';


const TerritoryFilterSelector: React.FC = () => {
  const { territories } = useDataContext();
  const filterByScope = getScopeFilter();
  const filterLabels = getFilterLabels();

  const getSuggestions = useMemo(() => {
    const getMatchDistance = (territory: TerritoryData): number =>
      filterByScope(territory) ? 0 : 1;
    const getMatchGroup = (territory: TerritoryData): string => {
      if (!filterByScope(territory)) return 'not ' + filterLabels.territoryScope;
      return 'matched';
    };

    return getSuggestionsFunction(
      territories.slice().sort(sortByPopulation),
      getMatchDistance,
      getMatchGroup,
    );
  }, [territories, filterByScope, filterLabels]);

  return (
    <EntityFilterSelector
      getSuggestions={getSuggestions}
      selectorLabel="In Territory"
      selectorDescription="Filter results by ones relevant in a territory."
      pageParameter={PageParamKey.territoryFilter}
    />
  );
};

export default TerritoryFilterSelector;
