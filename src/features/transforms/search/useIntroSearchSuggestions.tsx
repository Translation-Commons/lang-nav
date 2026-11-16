import { useCallback } from 'react';

import useCountries from '@features/data/context/useCountries';
import { useDataContext } from '@features/data/context/useDataContext';
import type { Suggestion } from '@features/params/Suggestion';
import usePageParams from '@features/params/usePageParams';

import { isLanguageOrMacrolanguage } from '@entities/language/LanguageTypes';

import { getTopMatches, toIntroSuggestion } from './introSuggestions';

const GROUP_LIMIT = 5;

export default function useIntroSearchSuggestions(): (query: string) => Promise<Suggestion[]> {
  const { searchBy } = usePageParams();
  const { languages } = useDataContext();
  const countries = useCountries();

  return useCallback(
    async (query: string) => {
      // Without a query, leave families and dialects out of the top languages.
      const languageCandidates = query
        ? languages
        : languages.filter((lang) => isLanguageOrMacrolanguage(lang.scope));
      return [
        ...getTopMatches(languageCandidates, query, searchBy, GROUP_LIMIT).map((ent) =>
          toIntroSuggestion(ent, query, searchBy, 'Languages'),
        ),
        ...getTopMatches(countries, query, searchBy, GROUP_LIMIT).map((ent) =>
          toIntroSuggestion(ent, query, searchBy, 'Countries'),
        ),
      ];
    },
    [languages, countries, searchBy],
  );
}
