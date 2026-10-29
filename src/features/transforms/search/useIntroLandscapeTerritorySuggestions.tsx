import { useCallback } from 'react';

import useCountries from '@features/data/context/useCountries';
import type { Suggestion } from '@features/params/Suggestion';
import usePageParams from '@features/params/usePageParams';

import { getTopMatches, toIntroSuggestion } from './introSuggestions';

const SUGGESTION_LIMIT = 8;

export default function useIntroLandscapeTerritorySuggestions(): (
  query: string,
) => Promise<Suggestion[]> {
  const { searchBy } = usePageParams();
  const countries = useCountries();

  return useCallback(
    async (query: string) =>
      getTopMatches(countries, query, searchBy, SUGGESTION_LIMIT).map((ent) =>
        toIntroSuggestion(ent, query, searchBy),
      ),
    [countries, searchBy],
  );
}
