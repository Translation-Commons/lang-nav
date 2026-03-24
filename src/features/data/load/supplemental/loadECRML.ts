import { LanguageData } from '@entities/language/LanguageTypes';

/**
 * Load ECRML (European Charter for Regional or Minority Languages) data
 * and apply protection status to locales.
 */
export async function loadECRML(
  getLanguage: (id: string) => LanguageData | undefined,
): Promise<void> {
  await fetch('data/other_sources/ecrml.tsv')
    .then((res) => res.text())
    .then((text) => text.split('\n'))
    .then((lines) => {
      const headerLineIndex = lines.findIndex((line) =>
        line.toLowerCase().startsWith('language code\t'),
      );
      if (headerLineIndex < 0) return;

      const headerParts = lines[headerLineIndex].split('\t').map((part) => part.trim());
      const languageCodeColumn = headerParts.findIndex((part) => part === 'Language Code');
      const regionCodeColumn = headerParts.findIndex((part) => part === 'isoRegionCode');
      const protectionColumn = headerParts.findIndex((part) =>
        part.startsWith('Level of protection under the Charter'),
      );

      if (languageCodeColumn < 0 || regionCodeColumn < 0 || protectionColumn < 0) return;

      lines
        .slice(headerLineIndex + 1)
        .filter((line) => line.trim() !== '' && !line.startsWith('#'))
        .forEach((line) => {
          const parts = line.split('\t');
          if (parts.length <= protectionColumn) {
            return;
          }

          const languageCodes = parts[languageCodeColumn]?.trim(); // May contain slashes like "ber/rif" or "hbs/bos"
          const territoryCode = parts[regionCodeColumn]?.trim(); // ISO region code (e.g., "BA", "ME")
          const protectionLevel = parts[protectionColumn]?.trim(); // Level of protection

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
            const locales = language.locales.filter((l) => l.territoryCode === territoryCode);

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
        });
    })
    .catch((err) => console.error('Error loading ECRML data:', err));
}
