import React, { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import { PageParamKey } from '@features/params/PageParamTypes';
import Field from '@features/transforms/fields/Field';

import { TerritoryData } from '@entities/territory/TerritoryTypes';

import { sortByPopulation } from '../../sorting/sort';
import { useFilterLabels } from '../FilterLabels';
import { getSuggestionsFunction } from '../getSuggestionsFunction';
import useFilters from '../useFilters';

import EntityFilterSelector from './EntityFilterSelector';

type Props = {
  showButtons?: boolean;
};

const TerritoryFilterSelector: React.FC<Props> = ({ showButtons = true }) => {
  const { territories } = useDataContext();
  const filters = useFilters();
  const filterLabels = useFilterLabels();

  const getSuggestions = useMemo(() => {
    const getMatchDistance = (territory: TerritoryData): number => {
      let score = 0;
      if (!filters[Field.TerritoryScope](territory)) score += 1;
      if (!filters[Field.LanguageFamily](territory)) score += 2;
      return score;
    };
    const getMatchGroup = (territory: TerritoryData): string => {
      if (!filters[Field.TerritoryScope](territory)) return 'not ' + filterLabels.territoryScope;
      if (!filters[Field.LanguageFamily](territory))
        return 'not ' + filterLabels.languageFamilyFilter;
      return 'matched';
    };

    return getSuggestionsFunction(
      territories.slice().sort(sortByPopulation),
      getMatchDistance,
      getMatchGroup,
    );
  }, [territories, filters, filterLabels]);

  return (
    <EntityFilterSelector
      getSuggestions={getSuggestions}
      pageParameter={PageParamKey.territoryFilter}
      showButtons={showButtons}
    />
  );
};

export default TerritoryFilterSelector;
