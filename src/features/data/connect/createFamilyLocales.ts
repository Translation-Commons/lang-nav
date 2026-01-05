import { ObjectType } from '@features/params/PageParamTypes';

import { LanguageData, LanguageDictionary, LanguageSource } from '@entities/language/LanguageTypes';
import { LocaleData, LocaleSource, PopulationSourceCategory } from '@entities/types/DataTypes';

// SOURCE is a constant to pick what source to use when creating family locales.
// Ideally we'd do this for all sources or the Combined source -- but because it can create so
// many locales (also compounded with regional locales), we limit it for now to just ISO
// Comparison          Locales   Heap Memory
// No family locales    32,415        98 MB
// ISO:                 36,149      ~103 MB
// Combined:            69,250      ~125 MB
const SOURCE = LanguageSource.ISO;

export function createFamilyLocales(
  languages: LanguageDictionary,
  locales: Record<string, LocaleData>,
): void {
  console.log('Creating family locales:', Object.keys(locales));
  Object.values(languages).forEach((language) => {
    console.log(
      language.ID,
      language[SOURCE]?.parentLanguage?.ID,
      language[SOURCE]?.childLanguages?.map((cl) => cl.ID),
    );
    // Only start recursively creating family locales for top-level languages
    if (language[SOURCE].parentLanguage != null || language[SOURCE].childLanguages?.length === 0)
      return;
    // Create locales for all the territories the language is used in
    createLocalesForLanguageFamily(language, locales);
  });
  console.log('Created family locales:', Object.keys(locales));
}

function createLocalesForLanguageFamily(
  language: LanguageData,
  allLocales: Record<string, LocaleData>,
): LocaleData[] {
  // Find the child locales for this language
  const childLocales =
    language[SOURCE].childLanguages?.flatMap((childLang) =>
      createLocalesForLanguageFamily(childLang, allLocales),
    ) || [];

  // For each childLocale, make a new locale for the language family or add the data to that language family
  childLocales.forEach((childLocale) => {
    // Filter our exceptional locales, we don't want to worry about those right now
    if (childLocale.variantTagCodes && childLocale.variantTagCodes.length > 0) return; // Skip variant locales
    if (childLocale.scriptCode) return; // Skip script-specific locales

    const { territory, territoryCode } = childLocale;
    if (!territory) return;

    // Create a new locale or update an existing family
    const newLocaleCode = `${language.ID}_${territoryCode}`;
    let newLocale = allLocales[newLocaleCode];

    if (newLocale == null) {
      const population =
        Math.min(childLocale.populationSpeaking || 0, territory.population) || undefined;

      // It isn't found yet, create it
      newLocale = {
        // Set a new locale code and territory code
        type: ObjectType.Locale,
        ID: newLocaleCode,
        codeDisplay: newLocaleCode,
        localeSource: LocaleSource.CreateFamilyLocales,

        // Add other parts of the locale code
        languageCode: language.ID,
        language,
        territoryCode: territory.ID,
        territory,

        // Other references that are undefined by definition but included in case the code is changed to allow them
        scriptCode: childLocale.scriptCode, // should be undefined
        writingSystem: childLocale.writingSystem, // should be undefined
        variantTagCodes:
          childLocale.variantTagCodes != null ? [...childLocale.variantTagCodes] : [], // dereference the array
        variantTags: childLocale.variantTags != null ? [...childLocale.variantTags] : [], // dereference the array

        // Initialize the population
        populationSpeaking: population,
        populationSpeakingPercent:
          population != null ? (population * 100) / territory.population : undefined,
        populationSource: PopulationSourceCategory.AggregatedFromLanguages,

        // Add stubs for required fields
        names: [],
        nameDisplay: newLocaleCode, // Will be computed later
      };

      // Add edges
      allLocales[newLocaleCode] = newLocale;
      if (!language.locales) language.locales = [];
      language.locales.push(newLocale);
      if (!territory.locales) territory.locales = [];
      territory.locales.push(newLocale);
    } else {
      // Add up population estimates
      // But only for locales that were created in this function
      if (
        childLocale.populationSpeaking != null &&
        newLocale.localeSource === LocaleSource.CreateFamilyLocales
      ) {
        // Most of this will be re-done in computeLanguageFamilyLocalePopulations after census data is added

        if (newLocale.populationSpeaking == null) newLocale.populationSpeaking = 0;
        // Note this may double count populations when people speak multiple languages in the family
        newLocale.populationSpeaking += childLocale.populationSpeaking || 0;
        newLocale.populationSpeakingPercent =
          (newLocale.populationSpeaking * 100) / territory.population;

        // At least we can max out the percentage at 100%
        if (newLocale.populationSpeakingPercent > 100) {
          newLocale.populationSpeakingPercent = 100;
          newLocale.populationSpeaking = territory.population;
        }
      }
    }
  });

  return language.locales || [];
}
