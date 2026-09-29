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

const LanguageFilterSelector: React.FC = () => {
  const { languages } = useDataContext();
  const filterBy = useFilters();
  const filterByScope = filterBy[Field.LanguageScope];
  const filterByTerritory = filterBy[Field.TerritoryList];
  const filterByWritingSystem = filterBy[Field.WritingSystem];
  const filterByLanguageFamily = filterBy[Field.LanguageFamily];
  const filterByLanguageSource = filterBy[Field.SourceForLanguage];
  const filterLabels = useFilterLabels();

  const getSuggestions = useMemo(() => {
    const getMatchDistance = (language: LanguageData): number => {
      let dist = 0;
      if (!filterByLanguageFamily(language)) dist += 1;
      if (!filterByWritingSystem(language)) dist += 2;
      if (!filterByTerritory(language)) dist += 4;
      if (!filterByScope(language)) dist += 8;
      if (!filterByLanguageSource(language)) dist += 16;
      return dist;
    };
    const getMatchGroup = (language: LanguageData): string => {
      if (!filterByLanguageFamily(language)) return 'not ' + filterLabels.languageFamilyFilter;
      if (!filterByWritingSystem(language)) return 'not ' + filterLabels.writingSystemFilter;
      if (!filterByTerritory(language)) return 'not ' + filterLabels.territoryFilter;
      if (!filterByScope(language)) return 'not ' + filterLabels.languageScope;
      if (!filterByLanguageSource(language)) return 'not ' + filterLabels.languageSource;
      return 'matched';
    };

    return getSuggestionsFunction(
      languages
        .filter((language) => (language.scope ?? 10) <= LanguageScope.Macrolanguage)
        .sort(sortByPopulation),
      getMatchDistance,
      getMatchGroup,
    );
  }, [
    filterByLanguageFamily,
    filterByScope,
    filterByTerritory,
    filterByWritingSystem,
    filterLabels,
    languages,
  ]);

  return (
    <EntityFilterSelector
      getSuggestions={getSuggestions}
      pageParameter={PageParamKey.languageFilter}
    />
  );
};

export default LanguageFilterSelector;
