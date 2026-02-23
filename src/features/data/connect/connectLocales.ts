import { LanguageDictionary } from '@entities/language/LanguageTypes';
import { getLocaleName } from '@entities/locale/LocaleStrings';
import { LocaleData, StandardLocaleCode } from '@entities/locale/LocaleTypes';
import { TerritoryCode, TerritoryData } from '@entities/territory/TerritoryTypes';
import { ScriptCode, WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

/**
 * Connects locales to their languages and territories
 * @param languagesByCode - A map of language codes to LanguageData objects
 * @param territoriesByCode - A map of territory codes to TerritoryData objects
 * @param locales - An array of LocaleData objects
 *
 * @returns - The updated array of LocaleData objects -- with some locales removed, if they were missing a match to a territory or language.
 */
export default function connectLocales(
  languages: LanguageDictionary,
  territories: Record<TerritoryCode, TerritoryData>,
  writingSystems: Record<ScriptCode, WritingSystemData>,
  locales: Record<StandardLocaleCode, LocaleData>,
): void {
  Object.values(locales).forEach((locale) => {
    const territory = locale.territoryCode ? territories[locale.territoryCode] : undefined;
    const language = languages[locale.languageCode];
    const writingSystem = locale.scriptCode ? writingSystems[locale.scriptCode] : undefined;

    if (territory != null) {
      if (!territory.locales) territory.locales = [];
      territory.locales.push(locale);
      locale.territory = territory;
      if (locale.populationSpeaking)
        locale.populationSpeakingPercent =
          (locale.populationSpeaking * 100) / (territory.population || 1);
    }
    if (language != null) {
      language.locales.push(locale);
      locale.language = language;
    }
    if (writingSystem != null) {
      if (!writingSystem.localesWhereExplicit) writingSystem.localesWhereExplicit = [];
      writingSystem.localesWhereExplicit.push(locale);
      locale.writingSystem = writingSystem;

      if (language != null) {
        if (!writingSystem.languages) writingSystem.languages = {};
        writingSystem.languages[language.ID] = language;
        if (language.primaryScriptCode != locale.scriptCode && locale.populationSpeaking != null) {
          if (!writingSystem.populationUpperBound) writingSystem.populationUpperBound = 0;
          writingSystem.populationUpperBound += locale.populationSpeaking;
        }

        // Connect the writing system to the language if not already connected
        if (language.writingSystems[writingSystem.ID] == null)
          language.writingSystems[writingSystem.ID] = writingSystem;
      }
    }

    // Update the locale's display name
    locale.nameDisplay = getLocaleName(locale);
  });
}
