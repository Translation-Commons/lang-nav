import { useCallback } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';

import { LanguageData } from '@entities/language/LanguageTypes';

import useDecoderSuggestions from './useDecoderSuggestions';

// These language codes won't raise errors because the issues are known to be misleading
const OVERRIDE_LANGUAGE_MATCH: Record<string, string> = {
  hokkien: 'taib1242',
  teochew: 'chao1238',
  mandarin: 'cmn',
  malay: 'zlm',
  other: 'mul',
  darija: 'ary',
  italian: 'ita',
};

const OVERRIDE_ALTS: Record<string, string[]> = {
  hokkien: ['nan'],
  teochew: ['nan'],
  mandarin: ['zho'],
  darija: ['arq', 'aeb'],
  malay: ['msa', 'zsm'],
  italian: ['ise', 'slf', 'itk'],
};

type FindLanguage = (searchString: string) => Promise<LanguageData[]>;

const useFindLanguage = (): FindLanguage => {
  const getDecoderSuggestions = useDecoderSuggestions();
  const { getLanguage } = useDataContext();

  const findLanguage: FindLanguage = useCallback(
    async (searchString: string) => {
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
    [getDecoderSuggestions, getLanguage],
  );

  return findLanguage;
};

export default useFindLanguage;
