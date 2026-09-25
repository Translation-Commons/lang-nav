import React, { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import { PageParamKey } from '@features/params/PageParamTypes';

import { LanguageData, LanguageScope } from '@entities/language/LanguageTypes';

import Field from '../../fields/Field';
import { sortByPopulation } from '../../sorting/sort';
import { useFilterLabels } from '../FilterLabels';
import { getSuggestionsFunction } from '../getSuggestionsFunction';
import useFilters from '../useFilters';

import EntityFilterSelector from './EntityFilterSelector';

const LanguageFamilyFilterSelector: React.FC = () => {
  const { languagesInSelectedSource: languages } = useDataContext();
  const filterBy = useFilters();
  const filterByTerritory = filterBy[Field.TerritoryList];
  const filterLabels = useFilterLabels();

  const getSuggestions = useMemo(() => {
    const getMatchDistance = (language: LanguageData): number => {
      let dist = 0;
      if (language.scope === LanguageScope.Subfamily) dist += 1;
      if (language.scope === LanguageScope.BroadGrouping) dist += 2;
      if (!filterByTerritory(language)) dist += 8;
      return dist;
    };
    const getMatchGroup = (language: LanguageData): string => {
      if (language.scope === LanguageScope.Subfamily) return 'subfamily';
      if (language.scope === LanguageScope.BroadGrouping) return 'broad grouping';
      if (!filterByTerritory(language)) return 'not ' + filterLabels.territoryFilter;
      return 'matched';
    };

    return getSuggestionsFunction(
      languages
        // Limting to ISO language families only right now because of data limitations
        .filter(
          (a) =>
            a.scope === LanguageScope.Family ||
            a.scope === LanguageScope.Subfamily ||
            a.scope === LanguageScope.BroadGrouping,
        )
        .sort(sortByPopulation),
      getMatchDistance,
      getMatchGroup,
    );
  }, [languages, filterByTerritory, filterLabels]);

  return (
    <EntityFilterSelector
      getSuggestions={getSuggestions}
      pageParameter={PageParamKey.languageFamilyFilter}
    />
  );
};

export default LanguageFamilyFilterSelector;
