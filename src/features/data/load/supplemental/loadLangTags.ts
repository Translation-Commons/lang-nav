// Source: https://ldml.api.sil.org/langtags.json (SIL langtags dataset, public domain)
// Docs: https://github.com/silnrsi/langtags/blob/master/doc/langtags.md
// A local copy is bundled at data/other_sources/langtags.json as a fallback / for
// offline builds. If refreshing this file, re-fetch from the URL above.

import { LanguageData, LanguageScope } from '@entities/language/LanguageTypes';
import { setLanguageNames } from '@entities/language/setLanguageNames';

export interface SILLanguage {
  iso639_3?: string;
  name?: string;
  names?: string[];
}

export async function loadLangTags(
  getLanguage: (id: string) => LanguageData | undefined,
): Promise<void> {
  return fetch('data/other_sources/langtags.json')
    .then((res) => res.json())
    .then((languages: SILLanguage[]) => {
      languages.forEach((language) => {
        if (!language.iso639_3) {
          return;
        }

        const lang = getLanguage(language.iso639_3);
        if (lang === undefined) {
          return;
        }

        if (lang.scope === LanguageScope.Macrolanguage) {
          return;
        }

        setLanguageNames(lang, language.names || []);
      });
    })
    .catch((err) => console.error('Error loading langtags data:', err));
}
