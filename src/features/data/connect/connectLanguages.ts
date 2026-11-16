import { LanguageDictionary } from '@entities/language/LanguageTypes';

/**
 * This extends the core language dictionary by adding alternative keys to access them.
 */
export function addAliasesToLanguageDictionary(languages: LanguageDictionary): LanguageDictionary {
  return Object.values(languages).reduce<LanguageDictionary>((acc, lang) => {
    const { ISO, Glottolog } = lang;

    // Expand the dictionary to index languages by their alternative language codes
    // if (ISO.code) languages[ISO.code] = lang; // should be redundant with the above
    if (ISO.code6391) languages[ISO.code6391] = lang;
    // if (ISO.code6392b) languages[ISO.code6392b] = lang;
    if (Glottolog.code) languages[Glottolog.code] = lang;
    return acc;
  }, languages);
}
