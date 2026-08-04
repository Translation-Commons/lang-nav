import React, { useMemo } from 'react';

import { LanguageData, LanguageScope } from '@entities/language/LanguageTypes';
import { useDataContext } from '@features/data/context/useDataContext';
import { PageParamKey } from '@features/params/PageParamTypes';
import EntityFilterSelector from './EntityFilterSelector';

import Field from '../../fields/Field';
import { sortByPopulation } from '../../sorting/sort';
import { getFilterLabels } from '../FilterLabels';
import { getSuggestionsFunction } from '../getSuggestionsFunction';
import useFilters from '../useFilters';

const LanguageFamilyFilterSelector: React.FC = () => {
  const { languagesInSelectedSource: languages } = useDataContext();
  const filterBy = useFilters();
  const filterByTerritory = filterBy[Field.Territory];
  const filterByWritingSystem = filterBy[Field.WritingSystem];
  const filterLabels = getFilterLabels();

  const getSuggestions = useMemo(() => {
    const getMatchDistance = (language: LanguageData): number => {
      let dist = 0;
      if (!filterByWritingSystem(language)) dist += 1;
      if (!filterByTerritory(language)) dist += 2;
      return dist;
    };
    const getMatchGroup = (language: LanguageData): string => {
      if (!filterByWritingSystem(language)) return 'not ' + filterLabels.writingSystemFilter;
      if (!filterByTerritory(language)) return 'not ' + filterLabels.territoryFilter;
      return 'matched';
    };

    return getSuggestionsFunction(
      languages
        // Limting to ISO language families only right now because of data limitations
        .filter((a) => a.scope === LanguageScope.Family && a.ISO.code != null)
        .sort(sortByPopulation),
      getMatchDistance,
      getMatchGroup,
    );
  }, [languages, filterByTerritory, filterByWritingSystem, filterLabels]);

  return (
    <EntityFilterSelector
      getSuggestions={getSuggestions}
      selectorLabel="Language Family"
      selectorDescription={
        <>
          Filter results to those relevant to a specific language family. This list only
          includes ISO language families because we have the most data for them.
        </>
      }
      pageParameter={PageParamKey.languageFamilyFilter}
    />
  );
};

export default LanguageFamilyFilterSelector;
