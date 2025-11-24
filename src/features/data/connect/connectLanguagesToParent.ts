import { LanguagesBySource, LanguageSource } from '@entities/language/LanguageTypes';

export function connectLanguagesToParent(languagesBySource: LanguagesBySource): void {
  // Connect general parents
  Object.values(languagesBySource[LanguageSource.Combined]).forEach((lang) => {
    Object.values(LanguageSource).forEach((source) => {
      const parentCode = lang[source].parentLanguageCode;
      if (parentCode != null) {
        const parent =
          languagesBySource[source][parentCode] ?? languagesBySource.Combined[parentCode];
        if (parent != null) {
          lang[source].parentLanguage = parent;
          if (parent[source].childLanguages == null) parent[source].childLanguages = [];
          parent[source].childLanguages.push(lang);
        }
      }
    });
  });
}
