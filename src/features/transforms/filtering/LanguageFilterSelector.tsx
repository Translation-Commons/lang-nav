import { TriangleAlertIcon } from 'lucide-react';
import React, { useCallback } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import { ObjectType, PageParamKey, SearchableField } from '@features/params/PageParamTypes';
import {
  SelectorDisplay,
  SelectorDisplayProvider,
  useSelectorDisplay,
} from '@features/params/ui/SelectorDisplayContext';
import SelectorLabel from '@features/params/ui/SelectorLabel';
import TextInput, { Suggestion } from '@features/params/ui/TextInput';
import usePageParams from '@features/params/usePageParams';

import { getSearchableField, HighlightedObjectField } from '@entities/ui/ObjectField';

import { getScopeFilter } from './filter';

type Props = { display?: SelectorDisplay };

const LanguageFilterSelector: React.FC<Props> = ({ display: manualDisplay }) => {
  const { languageFilter, updatePageParams } = usePageParams();
  const { languagesInSelectedSource: languages } = useDataContext();
  const filterByScope = getScopeFilter();
  const { display: inheritedDisplay } = useSelectorDisplay();
  const display = manualDisplay ?? inheritedDisplay;

  const getSuggestions = useCallback(
    async (query: string): Promise<Suggestion[]> => {
      const lowerCaseQuery = query.toLowerCase();
      const filteredLanguages = languages
        .filter((language) =>
          getSearchableField(language, SearchableField.NameOrCode)
            .toLowerCase()
            .split(/\W/g)
            .some((word) => word.startsWith(lowerCaseQuery)),
        )
        // Prioritize languages that are in scope, eg. show "German" before "Germanic"
        .sort((a, b) => (filterByScope(a) ? -1 : 1) - (filterByScope(b) ? -1 : 1));
      return filteredLanguages.map((object) => {
        const label = (
          <HighlightedObjectField
            object={object}
            field={SearchableField.NameOrCode}
            query={query}
          />
        );
        const searchString = getSearchableField(object, SearchableField.NameOrCode);
        return { objectID: object.ID, searchString, label };
      });
    },
    [languages, filterByScope],
  );

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
