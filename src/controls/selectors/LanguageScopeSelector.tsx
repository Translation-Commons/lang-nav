import React from 'react';

import { toSentenceCase } from '../../generic/stringUtils';
import { LanguageScope } from '../../types/LanguageTypes';
import { ObjectType } from '../../types/PageParamTypes';
import MultiChoiceOptions from '../components/MultiChoiceOptions';
import Selector from '../components/Selector';
import { usePageParams } from '../PageParamsContext';

const LanguageScopeSelector: React.FC = () => {
  const { languageScopes, updatePageParams, objectType } = usePageParams();

  if (![ObjectType.Language, ObjectType.Locale, ObjectType.Census].includes(objectType)) {
    return null; // Only application for language and locale objects
  }

  function getOptionLabel(scope: LanguageScope): string {
    return toSentenceCase(getLanguageScopePlural(scope));
  }
  const selectorDescription =
    'Filter what level of language-type objects are shown, such as families, macrolanguages, languages, dialects, and special codes.';

  return (
    <Selector selectorLabel="Language Scope:" selectorDescription={selectorDescription}>
      <MultiChoiceOptions
        options={Object.values(LanguageScope)}
        onToggleOption={(scope: LanguageScope) =>
          languageScopes.includes(scope)
            ? updatePageParams({ languageScopes: languageScopes.filter((s) => s != scope) })
            : updatePageParams({ languageScopes: [...languageScopes, scope] })
        }
        selected={languageScopes}
        getOptionLabel={getOptionLabel}
      />
    </Selector>
  );
};

export function getLanguageScopePlural(scope: LanguageScope): string {
  switch (scope) {
    case LanguageScope.Family:
      return 'language families';
    case LanguageScope.Macrolanguage:
      return 'macrolanguages';
    case LanguageScope.Language:
      return 'languages';
    case LanguageScope.Dialect:
      return 'dialects';
    case LanguageScope.SpecialCode:
      return 'special codes';
  }
}

export default LanguageScopeSelector;
