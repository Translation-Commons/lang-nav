import { isIgnoredLanguageCode } from '@entities/census/parseCensusLanguageRow';
import { LanguageData } from '@entities/language/LanguageTypes';

/**
 * Load Windows 11 language pack availability data.
 * File format:
 * Language Code\tLanguage\tLocale\tWriting System
 */
export async function loadWin11LanguagePacks(
  getLanguage: (id: string) => LanguageData | undefined,
): Promise<void> {
  await fetch('data/other_sources/win11_language_packs.tsv')
    .then((res) => res.text())
    .then((text) => text.split('\n').filter((line) => line.trim() !== '' && !line.startsWith('#')))
    .then((lines) => {
      lines.forEach((line) => {
        const parts = line.split('\t');
        if (parts.length < 2) return;

        const languageCodePath = (parts[0] ?? '').trim();
        if (languageCodePath === '' || languageCodePath === 'Language Code') return;

        const name = (parts[1] ?? '').trim();
        const locale = (parts[2] ?? '').trim() || undefined;
        const writingSystem = (parts[3] ?? '').trim() || undefined;
        const languageCodes = languageCodePath.split('/');

        languageCodes.forEach((code) => {
          if (isIgnoredLanguageCode(code)) return;

          const language = getLanguage(code);
          if (!language) return;

          if (!language.win11LanguagePacks) language.win11LanguagePacks = [];
          language.win11LanguagePacks.push({ languageCodePath, name, locale, writingSystem });
        });
      });
    })
    .catch((err) => console.error('Error loading Windows 11 language packs data:', err));
}
