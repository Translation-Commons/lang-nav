import React, { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import { PageParamKey } from '@features/params/PageParamTypes';
import { SelectorDisplay } from '@features/params/ui/SelectorDisplayContext';
import usePageParams from '@features/params/usePageParams';

import { LanguageData, LanguageScope } from '@entities/language/LanguageTypes';

import Field from '../../fields/Field';
import { sortByPopulation } from '../../sorting/sort';
import { getFilterLabels } from '../FilterLabels';
import { getSuggestionsFunction } from '../getSuggestionsFunction';
import useFilters from '../useFilters';

import EntityFilterSelector from './EntityFilterSelector';

type Props = { display?: SelectorDisplay };

const LanguageFamilyFilterSelector: React.FC<Props> = ({ display }) => {
  const { languageFamilyFilter, updatePageParams } = usePageParams();
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
      display={display}
      getSuggestions={getSuggestions}
      selectorLabel="Language Family"
      selectorDescription={
        <>
          Filter results to those relevant to a specific language family. This list only includes
          ISO language families because we have the most data for them.
        </>
      }
      onSubmit={(languageFamilyFilter: string) => updatePageParams({ languageFamilyFilter })}
      value={languageFamilyFilter}
      pageParameter={PageParamKey.languageFamilyFilter}
    />
  );
};

export default LanguageFamilyFilterSelector;
