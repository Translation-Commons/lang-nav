import React, { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import { PageParamKey } from '@features/params/PageParamTypes';
import { SelectorDisplay } from '@features/params/ui/SelectorDisplayContext';
import usePageParams from '@features/params/usePageParams';

import { TerritoryData } from '@entities/territory/TerritoryTypes';

import { sortByPopulation } from '../../sorting/sort';
import { getScopeFilter } from '../filter';
import { getFilterLabels } from '../FilterLabels';
import { getSuggestionsFunction } from '../getSuggestionsFunction';

import EntityFilterSelector from './EntityFilterSelector';

type Props = { display?: SelectorDisplay };

const TerritoryFilterSelector: React.FC<Props> = ({ display }) => {
  const { territoryFilter, updatePageParams } = usePageParams();
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
      display={display}
      getSuggestions={getSuggestions}
      selectorLabel="In Territory"
      selectorDescription="Filter results by ones relevant in a territory."
      onSubmit={(territoryFilter: string) => updatePageParams({ territoryFilter })}
      value={territoryFilter}
      pageParameter={PageParamKey.territoryFilter}
    />
  );
};

export default TerritoryFilterSelector;
