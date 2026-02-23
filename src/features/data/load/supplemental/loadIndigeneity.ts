import { LanguageData } from '@entities/language/LanguageTypes';

// this is intended to be run after the main data is loaded (and symlinks exist)
export async function loadIndigeneity(
  getLanguage: (id: string) => LanguageData | undefined,
): Promise<void> {
  // Language ID	Territory ID	LanguageFormedInThisRegion	TimeLanguageAntecedentsEstablishedBefore1500
  await fetch('data/indigeneity.tsv')
    .then((res) => res.text())
    .then((text) =>
      text
        .split('\n')
        .slice(1) // Remove the header row
        .filter((line) => line.trim() !== '' && !line.startsWith('#')),
    )
    .then((lines) =>
      lines.forEach((line) => {
        // Language ID	Territory ID	LanguageFormedInThisRegion	TimeLanguageAntecedentsEstablishedBefore1500
        const parts = line.split('\t');
        const language = getLanguage(parts[0]);
        if (!language || parts.length < 4) return;

        const locales = language.locales.filter((l) => l.territory?.ID === parts[1]);
        if (locales.length === 0) return;

        const formedInThisRegion = parts[2] === '1' ? true : parts[2] === '0' ? false : undefined;
        const antecedentsBefore1500 =
          parts[3] === '1' ? true : parts[3] === '0' ? false : undefined;
        locales.forEach((locale) => {
          locale.langFormedHere = formedInThisRegion;
          locale.historicPresence = antecedentsBefore1500;
        });
      }),
    )
    .catch((err) => console.error('Error loading indigeneity data:', err));
}
