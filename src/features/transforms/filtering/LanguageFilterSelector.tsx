import { TriangleAlertIcon } from 'lucide-react';
import React, { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import { ObjectType, PageParamKey } from '@features/params/PageParamTypes';
import {
  SelectorDisplay,
  SelectorDisplayProvider,
  useSelectorDisplay,
} from '@features/params/ui/SelectorDisplayContext';
import SelectorLabel from '@features/params/ui/SelectorLabel';
import TextInput from '@features/params/ui/TextInput';
import usePageParams from '@features/params/usePageParams';

import { LanguageData } from '@entities/language/LanguageTypes';

import Field from '../fields/Field';
import { getSortFunctionParameterized } from '../sorting/sort';

import { getScopeFilter } from './filter';
import { getFilterByTerritory, getFilterByWritingSystem } from './filterByConnections';
import { getFilterLabels } from './FilterLabels';
import { getSuggestionsFunction } from './getSuggestionsFunction';

type Props = { display?: SelectorDisplay };

const LanguageFilterSelector: React.FC<Props> = ({ display: manualDisplay }) => {
  const { languageFilter, updatePageParams } = usePageParams();
  const { languagesInSelectedSource: languages } = useDataContext();
  const sortFunction = getSortFunctionParameterized(Field.Population);
  const filterByScope = getScopeFilter();
  const filterByTerritory = getFilterByTerritory();
  const filterByWritingSystem = getFilterByWritingSystem();
  const filterLabels = getFilterLabels();
  const { display: inheritedDisplay } = useSelectorDisplay();
  const display = manualDisplay ?? inheritedDisplay;

  const getSuggestions = useMemo(() => {
    const getMatchDistance = (language: LanguageData): number => {
      let dist = 0;
      if (!filterByWritingSystem(language)) dist += 1;
      if (!filterByTerritory(language)) dist += 2;
      if (!filterByScope(language)) dist += 4;
      return dist;
    };
    const getMatchGroup = (language: LanguageData): string => {
      if (!filterByWritingSystem(language)) return 'not ' + filterLabels.writingSystemFilter;
      if (!filterByTerritory(language)) return 'not ' + filterLabels.territoryFilter;
      if (!filterByScope(language)) return 'not ' + filterLabels.languageScope;
      return 'matched';
    };

    return getSuggestionsFunction(languages.sort(sortFunction), getMatchDistance, getMatchGroup);
  }, [
    languages,
    filterByScope,
    filterByTerritory,
    filterByWritingSystem,
    filterLabels,
    sortFunction,
  ]);

  return (
    <SelectorDisplayProvider display={display}>
      <div className="selector" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
        <SelectorLabel
          label="Language"
          description={
            <>
              Filter results to those relevant to a specific language, language family, or dialect.
              You can enter either the language name or its code. For example, entering
              &quot;Spanish&quot; or <code>spa</code> will filter to objects relevant to Spanish.{' '}
              <LanguageFilterDescription />
            </>
          }
        />
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <TextInput
            inputStyle={{ minWidth: '8em' }}
            getSuggestions={getSuggestions}
            onSubmit={(languageFilter: string) => updatePageParams({ languageFilter })}
            pageParameter={PageParamKey.languageFilter}
            placeholder="Name or code"
            value={languageFilter}
          />
        </div>
      </div>
    </SelectorDisplayProvider>
  );
};

const LanguageFilterDescription: React.FC = () => {
  const { objectType } = usePageParams();
  switch (objectType) {
    case ObjectType.Language:
      return (
        <>
          <strong>Language view only:</strong> Selecting a language family will show the languages
          in the family. Dialects will also appear if they are enabled.
        </>
      );
    case ObjectType.Territory:
      return <>This will filter territories to ones where the selected language is used.</>;
    case ObjectType.WritingSystem:
      return <>This will filter writing systems to ones used for the selected language.</>;
    case ObjectType.VariantTag:
      return <>This will filter variant tags for ones that are intended for this language.</>;
    case ObjectType.Locale:
      return <>This will filter locales with the selected language.</>;
    case ObjectType.Census:
      return (
        <>
          <TriangleAlertIcon size="1em" style={{ color: 'var(--color-text-yellow)' }} /> Censuses
          are not currently supported by this filter.
        </>
      );
  }
};

export default LanguageFilterSelector;
