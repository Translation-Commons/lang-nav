import { useCallback } from 'react';

import LoadingStage from '@features/data/context/LoadingStage';
import { useDataContext } from '@features/data/context/useDataContext';

import type { LanguageData } from '@entities/language/LanguageTypes';

import useDecoderSuggestions from './useDecoderSuggestions';

// These language codes won't raise errors because the issues are known to be misleading
const OVERRIDE_LANGUAGE_MATCH: Record<string, string> = {
  other: 'mul',
};

const OVERRIDE_ALTS: Record<string, string[]> = {};

type FindLanguage = (searchString: string) => Promise<LanguageData[]>;

const useFindLanguage = (): FindLanguage => {
  const getDecoderSuggestions = useDecoderSuggestions();
  const { getLanguage, loadingStage } = useDataContext();

  const findLanguage: FindLanguage = useCallback(
    async (searchString: string) => {
      if (loadingStage < LoadingStage.AlgorithmsFinished) return [];
      const searchLower = searchString.toLowerCase().trim();
      if (searchLower === '' || searchLower.startsWith('#')) return [];

      if (OVERRIDE_LANGUAGE_MATCH[searchLower]) {
        const overrideCode = OVERRIDE_LANGUAGE_MATCH[searchLower];
        const overrideLang = getLanguage(overrideCode);
        if (!overrideLang) return [];

        if (OVERRIDE_ALTS[searchLower]) {
          const altCodes = OVERRIDE_ALTS[searchLower];
          const altLangs = altCodes.map(getLanguage).filter(Boolean);
          return [overrideLang, ...altLangs].filter((l): l is LanguageData => l != null);
        }
        return [overrideLang];
      }
      let suggestions = await getDecoderSuggestions(searchString);
      if (suggestions.length === 0 && searchString.includes('('))
        suggestions = await getDecoderSuggestions(searchString.split('(')[0].trim()); // If no results, try removing parenthetical

      return suggestions.filter((l) => l != null) as LanguageData[];
    },
    [getDecoderSuggestions, getLanguage, loadingStage],
  );

  return findLanguage;
};

export default useFindLanguage;
