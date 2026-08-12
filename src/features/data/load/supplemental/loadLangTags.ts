// A local copy is bundled at data/other_sources/langtags.tsv as a fallback / for
// offline builds. If refreshing this file, re-fetch from the URL above.
// See scripts/convertLangTagsToTsv.mjs for the JSON -> TSV conversion.

import { LanguageData } from '@entities/language/LanguageTypes';
import { setLanguageNames } from '@entities/language/setLanguageNames';

export async function loadLangTags(
  getLanguage: (id: string) => LanguageData | undefined,
): Promise<void> {
  return fetch('data/other_sources/langtags.tsv')
    .then((res) => res.text())
    .then((text) =>
      text
        .split('\n')
        .slice(1) // Remove "iso639_3\tiso639_3extra\tnames" header row
        .filter((line) => line.trim() !== '' && !line.startsWith('#')),
    )
    .then((lines) => {
      lines.forEach((line) => {
        const [isoCode, isoCodeExtra, namesColumn] = line.split('\t');

        const targetCodes = isoCodeExtra ? isoCodeExtra.split(';') : [isoCode];
        const names = namesColumn ? namesColumn.split(';') : [];

        targetCodes.forEach((code) => {
          const lang = getLanguage(code);
          if (!lang) return;
          setLanguageNames(lang, names);
        });
      });
    })
    .catch((err) => console.error('Error loading langtags data:', err));
}
