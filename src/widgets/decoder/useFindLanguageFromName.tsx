import { useDataContext } from '@features/data/context/useDataContext';
import { SearchableField } from '@features/params/PageParamTypes';
import useFilteredEntities from '@features/transforms/filtering/useFilteredEntities';
import getSubstringFilterOnQuery from '@features/transforms/search/getSubstringFilterOnQuery';

// These language codes won't raise errors because the issues are known to be misleading
const OVERRIDE_LANGUAGE_MATCH: Record<string, string> = {
  hokkien: 'taib1242',
  teochew: 'chao1238',
  malay: 'zlm',
  other: 'mul',
};

const useFindLanguage = () => {
  const { languagesInSelectedSource } = useDataContext();
  const { filteredEntities: languageEnts } = useFilteredEntities({
    inputEntities: languagesInSelectedSource,
  });
  return (searchString: string) => {
    const searchLower = searchString.toLowerCase();
    if (OVERRIDE_LANGUAGE_MATCH[searchLower]) {
      const overrideCode = OVERRIDE_LANGUAGE_MATCH[searchLower];
      const overrideLang = languageEnts.find((l) => l.ID === overrideCode);
      return overrideLang;
    }
    const ents = languageEnts.filter(
      getSubstringFilterOnQuery(searchString, SearchableField.NameAny),
    );
    const exactMatch = ents.find((e) => e.nameDisplay.toLowerCase() === searchLower);
    if (exactMatch) return exactMatch;
    const matchInList = ents.find((e) => e.names.some((n) => n.toLowerCase() === searchLower));
    if (matchInList) return matchInList;
    return ents[0];
  };
};

export default useFindLanguage;
