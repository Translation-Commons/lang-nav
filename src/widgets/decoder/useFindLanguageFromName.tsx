import { useDataContext } from '@features/data/context/useDataContext';
import { SearchableField } from '@features/params/PageParamTypes';
import useFilteredEntities from '@features/transforms/filtering/useFilteredEntities';
import getSubstringFilterOnQuery from '@features/transforms/search/getSubstringFilterOnQuery';

import { LanguageData } from '@entities/language/LanguageTypes';

// These language codes won't raise errors because the issues are known to be misleading
const OVERRIDE_LANGUAGE_MATCH: Record<string, string> = {
  hokkien: 'taib1242',
  teochew: 'chao1238',
  malay: 'zlm',
  other: 'mul',
};

const OVERRIDE_ALTS: Record<string, string[]> = {
  hokkien: ['nan'],
  teochew: ['nan'],
  malay: ['msa', 'zsm'],
};

const useFindLanguage = (): ((searchString: string) => LanguageData[]) => {
  const { languagesInSelectedSource } = useDataContext();
  const { filteredEntities: languageEnts } = useFilteredEntities({
    inputEntities: languagesInSelectedSource,
  });
  const search = (searchString: string) => {
    const searchLower = searchString.toLowerCase();
    if (OVERRIDE_LANGUAGE_MATCH[searchLower]) {
      const overrideCode = OVERRIDE_LANGUAGE_MATCH[searchLower];
      const overrideLang = languageEnts.find((l) => l.ID === overrideCode);
      if (!overrideLang) return [];

      if (OVERRIDE_ALTS[searchLower]) {
        const altCodes = OVERRIDE_ALTS[searchLower];
        const altLangs = languageEnts.filter((l) => altCodes.includes(l.ID));
        return [overrideLang, ...altLangs];
      }
      return [overrideLang];
    }
    const ents = languageEnts.filter(
      getSubstringFilterOnQuery(searchString, SearchableField.NameAny),
    );
    if (ents.length === 0 && searchString.includes('('))
      return search(searchString.split('(')[0].trim()); // If no results, try removing parenthetical

    const exactMatch = ents.filter((e) => e.nameDisplay.toLowerCase() === searchLower);
    if (exactMatch.length)
      return [
        exactMatch,
        ...ents.filter((e) => e.nameDisplay.toLowerCase() !== searchLower),
      ].flat();
    const matchAnyName = ents.filter((e) => e.names.some((n) => n.toLowerCase() === searchLower));
    if (matchAnyName.length) return matchAnyName;
    return ents;
  };
  return search;
};

export default useFindLanguage;
