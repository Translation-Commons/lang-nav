import {
  LanguageDictionary,
  LanguagesBySource,
  LanguageScope,
} from '@entities/language/LanguageTypes';

const MAX_ISO_LANG_CODE_LENGTH = 3;

/**
 * Recompose the structure of languages, leaving the primary index intact but also
 * creating 4 other indices based on the definitions of languages from ISO, UNESCO, Glottolog, and CLDR
 */
export function groupLanguagesBySource(languages: LanguageDictionary): LanguagesBySource {
  return {
    Combined: languages,
    ISO: Object.values(languages).reduce<LanguageDictionary>((isoLangs, lang) => {
      const code = lang.ISO.code;
      if (code != null && code.length <= MAX_ISO_LANG_CODE_LENGTH) isoLangs[code] = lang;
      return isoLangs;
    }, {}),
    BCP: Object.values(languages).reduce<LanguageDictionary>((bcpLangs, lang) => {
      const code = lang.ISO.code6391 ?? lang.ISO.code;
      if (code != null && code.length <= MAX_ISO_LANG_CODE_LENGTH) bcpLangs[code] = lang;
      return bcpLangs;
    }, {}),
    UNESCO: Object.values(languages).reduce<LanguageDictionary>((unescoLangs, lang) => {
      const code = lang.UNESCO.code;
      if (code != null && lang.viabilityConfidence != null && lang.viabilityConfidence != 'No')
        unescoLangs[code] = lang;
      return unescoLangs;
    }, {}),
    Glottolog: Object.values(languages).reduce<LanguageDictionary>((glottoLangs, lang) => {
      const code = lang.Glottolog.code;
      if (code != null) glottoLangs[code] = lang;
      return glottoLangs;
    }, {}),
    CLDR: Object.values(languages).reduce<LanguageDictionary>((cldrLangs, lang) => {
      const code = lang.ISO.code6391 ?? lang.ISO.code;
      if (
        code != null &&
        lang.scope !== LanguageScope.Family &&
        code.length <= MAX_ISO_LANG_CODE_LENGTH
      )
        cldrLangs[code] = lang;
      return cldrLangs;
    }, {}),
    Ethnologue: Object.values(languages).reduce<LanguageDictionary>((ethnoLangs, lang) => {
      const code = lang.Ethnologue.code;
      if (code != null) ethnoLangs[code] = lang;
      return ethnoLangs;
    }, {}),
  };
}
