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
          // Prevent cycles which cause infinite recursion later
          let curr: typeof parent | undefined = parent;
          let isCycle = false;
          while (curr != null) {
            if (curr.ID === lang.ID) {
              isCycle = true;
              break;
            }
            curr = curr[source].parentLanguage;
          }
          if (isCycle) {
            console.warn(`Cycle detected in ${source} ancestry: ${lang.ID} -> ${parent.ID}`);
            return;
          }

          lang[source].parentLanguage = parent;
          if (parent[source].childLanguages == null) parent[source].childLanguages = [];
          if (!parent[source].childLanguages.find((l) => l.ID === lang.ID))
            parent[source].childLanguages.push(lang);
        }
      }
    });
  });
}
