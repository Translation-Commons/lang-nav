import React, { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import { PageParamKey } from '@features/params/PageParamTypes';

import { TerritoryData } from '@entities/territory/TerritoryTypes';

import { sortByPopulation } from '../../sorting/sort';
import { useScopeFilter } from '../filter';
import { useFilterLabels } from '../FilterLabels';
import { getSuggestionsFunction } from '../getSuggestionsFunction';

import EntityFilterSelector from './EntityFilterSelector';

type Props = {
  showButtons?: boolean;
};

const TerritoryFilterSelector: React.FC<Props> = ({ showButtons = true }) => {
  const { territories } = useDataContext();
  const filterByScope = useScopeFilter();
  const filterLabels = useFilterLabels();

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
      pageParameter={PageParamKey.territoryFilter}
      showButtons={showButtons}
    />
  );
};

export default TerritoryFilterSelector;
