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
      lines.forEach((line, lineNumber) => {
        // Language ID	Territory ID	LanguageFormedInThisRegion	TimeLanguageAntecedentsEstablishedBefore1500
        const parts = line.split('\t');
        const language = getLanguage(parts[0]);
        if (!language || parts.length < 4) return;

        const locales = language.locales.filter((l) => l.territory?.ID === parts[1]);
        if (locales.length === 0) {
          console.debug(
            `No locales found for indigeneity data (line ${lineNumber + 2}: ${line}) in data/indigeneity.tsv.`,
          );
          return;
        }
        if (locales[0].langFormedHere != null || locales[0].historicPresence != null) {
          console.debug(
            `Multiple values for indigeneity data for locale ${locales[0].ID} (line ${lineNumber + 2}) in data/indigeneity.tsv. Please delete the duplicate entry.`,
          );
          return;
        }
        const formedInThisRegion = parts[2] === '1' ? true : parts[2] === '0' ? false : undefined;
        const antecedentsBefore1500 =
          parts[3] === '1' ? true : parts[3] === '0' ? false : undefined;

        if (formedInThisRegion == null && antecedentsBefore1500 == null) {
          console.debug(
            `No valid indigeneity values for ${locales[0].ID} (line ${lineNumber + 2}) in data/indigeneity.tsv. Expected 1, 0, or empty for columns 3 and 4.`,
          );
          return;
        }
        locales.forEach((locale) => {
          locale.langFormedHere = formedInThisRegion;
          locale.historicPresence = antecedentsBefore1500;
        });
      }),
    )
    .catch((err) => console.error('Error loading indigeneity data:', err));
}
