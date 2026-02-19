import React from 'react';

import Selector from '@features/params/ui/Selector';
import usePageParams from '@features/params/usePageParams';

import { LanguageScope } from '@entities/language/LanguageTypes';

import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';

const LanguageScopeSelector: React.FC = () => {
  const { languageScopes, updatePageParams } = usePageParams();

  const selectorDescription =
    'Filter what level of language-type objects are shown, such as families, macrolanguages, languages, dialects, and special codes.';

  return (
    <Selector
      selectorLabel="Languoid Type"
      labelWhenEmpty="Any"
      selectorDescription={selectorDescription}
      options={Object.values(LanguageScope).filter((s) => typeof s === 'number') as LanguageScope[]}
      onChange={(scope: LanguageScope) =>
        languageScopes.includes(scope)
          ? updatePageParams({ languageScopes: languageScopes.filter((s) => s != scope) })
          : updatePageParams({ languageScopes: [...languageScopes, scope] })
      }
      selected={languageScopes}
      getOptionLabel={getLanguageScopeLabel}
    />
  );
};

export default LanguageScopeSelector;
