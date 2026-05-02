import { isIgnoredLanguageCode } from '@entities/census/parseCensusLanguageRow';
import { LanguageData } from '@entities/language/LanguageTypes';
import { setLanguageNames } from '@entities/language/setLanguageNames';

/**
 * Load UDHR (Universal Declaration of Human Rights) data
 * File format:
Language Path	Language	Variant	DocumentURL
som/afas1238	Af Marka		af-marka
aze/azj	Azeri/Azerbaijani (Latin)	Latn	azeriazerbaijani-latin
aze/azj	Azeri/Azerbaijani (Cyrillic)	Cyrl	azeriazerbaijani-cyrillic
 */
export async function loadUDHR(
  getLanguage: (id: string) => LanguageData | undefined,
): Promise<void> {
  await fetch('data/tc/udhr.tsv')
    .then((res) => res.text())
    .then((text) => text.split('\n').filter((line) => line.trim() !== '' && !line.startsWith('#')))
    .then((lines) => {
      lines.forEach((line) => {
        const parts = line.split('\t');
        if (parts.length < 4) return;

        const languageCodePath = parts[0]; // May contain slashes like "ber/rif" or "hbs/bos"
        const name = parts[1]; // Full name, eg. Ñahñú (Otomí)
        const languageName = name.split('(')[0].trim(); // Language name, removing any parenthetical information, Ñahñú (Otomí) -> Ñahñú
        const variant = parts[2]; // Variant (e.g., "Latn", "Cyrl")
        const documentURL = parts[3];
        const languageCodes = languageCodePath.split('/'); // Split multiple language code parts into individual language codes

        languageCodes.forEach((code, index) => {
          const language = getLanguage(code);
          if (language) {
            if (isIgnoredLanguageCode(code)) return; // Skip ignored language codes like "mis"

            // Add the UDHR data
            if (!language.udhr) language.udhr = [];
            language.udhr.push({ languageCodePath, name, variant, documentURL });

            // If its the final language code, add the language name
            if (index + 1 === languageCodes.length) setLanguageNames(language, [languageName]);
          }
        });
      });
    })
    .catch((err) => console.error('Error loading UDHR data:', err));
}
