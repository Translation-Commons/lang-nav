import { LanguageData } from '@entities/language/LanguageTypes';

/**
 * Load ECRML (European Charter for Regional or Minority Languages) data
 * and apply protection status to locales.
 *
 * */
export async function loadECRML(
  getLanguage: (id: string) => LanguageData | undefined,
): Promise<void> {
  await fetch('data/other_sources/ecrml.tsv')
    .then((res) => res.text())
    .then((text) =>
      text
        .split('\n')
        .slice(5) // Remove the first 4 header rows
        .filter((line) => line.trim() !== '' && !line.startsWith('#')),
    )
    .then((lines) =>
      lines.forEach((line) => {
        // Language Code	Language Name	State Party	isoRegionCode	Notes	Level of protection under the Charter (Articles applying to the language concerned)
        const parts = line.split('\t');
        if (parts.length < 6) {
          return;
        }

        const languageCodes = parts[0]; // May contain slashes like "ber/rif" or "hbs/bos"
        const territoryCode = parts[3]?.trim().toLowerCase(); // ISO region code (e.g., "ba", "me")
        const protectionLevel = parts[5]?.trim(); // Level of protection

        if (!languageCodes || !territoryCode || !protectionLevel) {
          return;
        }

        // Try all language codes (handles cases like "ber/rif" or "hbs/bos")
        // Reverse order to prioritize child languages (e.g., "rif" before "ber")
        const codesToTry = languageCodes
          .split('/')
          .map((code) => code.trim())
          .reverse();

        for (const langCode of codesToTry) {
          const language = getLanguage(langCode);
          if (!language) continue;

          // Find locales that match this language + territory combination
          const locales = language.locales.filter(
            (l) => l.territoryCode?.toLowerCase() === territoryCode,
          );

          if (locales.length > 0) {
            locales.forEach((locale) => {
              if (locale.ecrmlProtection != null) {
                return;
              }
              locale.ecrmlProtection = protectionLevel;
            });
            break; // Found match, no need to try other language codes
          }
        }
      }),
    )
    .catch((err) => console.error('Error loading ECRML data:', err));
}
