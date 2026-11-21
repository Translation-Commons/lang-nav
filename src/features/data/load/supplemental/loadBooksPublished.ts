import { isIgnoredLanguageCode } from '@entities/census/parseCensusLanguageRow';
import { LanguageData } from '@entities/language/LanguageTypes';

// Code	Language	Titles Annually
// eng	English	547,732
// zho	Chinese	439,358
// spa	Spanish	166,775

export function loadBooksPublished(
  getLanguage: (id: string) => LanguageData | undefined,
): Promise<void> {
  return fetch('data/other_sources/booksPublished.tsv')
    .then((res) => res.text())
    .then((text) =>
      text
        .split('\n')
        .slice(1) // Remove the header row
        .filter((line) => line.trim() !== '' && !line.startsWith('#')),
    )
    .then((lines) =>
      lines.forEach((line) => {
        const parts = line.split('\t');
        const code = parts[0];
        const booksPublishedAnnually = parseInt(parts[2].replace(/,/g, ''));

        code.split('/').forEach((languageCode) => {
          if (isIgnoredLanguageCode(languageCode)) return;
          const lang = getLanguage(languageCode);
          if (lang == null) return;
          if (lang?.books) lang.books += booksPublishedAnnually;
          else lang.books = booksPublishedAnnually;
        });
      }),
    )
    .catch((err) => console.error('Error loading TSV:', err));
}
