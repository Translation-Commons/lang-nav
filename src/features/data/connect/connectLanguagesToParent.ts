import { LanguageDictionary, LanguageSource } from '@entities/language/LanguageTypes';

export function connectLanguagesToParent(languages: LanguageDictionary): void {
  // Connect general parents
  Object.values(languages).forEach((lang) => {
    Object.values(LanguageSource).forEach((source) => {
      const parentCode = lang[source]?.parentLanguageCode;
      if (parentCode != null) {
        const parent = languages[parentCode];
        if (parent != null) {
          lang[source].parentLanguage = parent;
          if (parent[source].childLanguages == null) parent[source].childLanguages = [];
          if (!parent[source].childLanguages.find((l) => l.ID === lang.ID))
            parent[source].childLanguages.push(lang);
        }
      }
    });
  });
}
