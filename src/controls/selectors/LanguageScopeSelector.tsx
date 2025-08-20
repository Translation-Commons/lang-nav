import React from 'react';

import { toSentenceCase } from '../../generic/stringUtils';
import { LanguageScope } from '../../types/LanguageTypes';
import Selector from '../components/Selector';
import { usePageParams } from '../PageParamsContext';

const LanguageScopeSelector: React.FC = () => {
  const { languageScopes, updatePageParams } = usePageParams();

  function getOptionLabel(scope: LanguageScope): string {
    return toSentenceCase(getLanguageScopePlural(scope));
  }
  const selectorDescription =
    'Filter what level of language-type objects are shown, such as families, macrolanguages, languages, dialects, and special codes.';

  return (
    <Selector
      selectorLabel="Language Type"
      selectorDescription={selectorDescription}
      options={Object.values(LanguageScope)}
      onChange={(scope: LanguageScope) =>
        languageScopes.includes(scope)
          ? updatePageParams({ languageScopes: languageScopes.filter((s) => s != scope) })
          : updatePageParams({ languageScopes: [...languageScopes, scope] })
      }
      selected={languageScopes}
      getOptionLabel={getOptionLabel}
    />
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
