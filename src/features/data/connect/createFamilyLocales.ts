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
  Object.values(languages).forEach((language) => {
    // Only start recursively creating family locales for top-level languages
    if (language[SOURCE].parentLanguage != null || language[SOURCE].childLanguages?.length === 0)
      return;
    // Create locales for all the territories the language is used in
    createLocalesForLanguageFamily(language, locales);
  });
  createFamilyLocales2(locales);
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
        populationSource: PopulationSourceCategory.Aggregated,

        // Add stubs for required fields
        names: [],
        nameDisplay: newLocaleCode, // Will be computed later
        familyLocales: [childLocale], // Keep track of the original locales that were aggregated
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
        if (newLocale.populationSpeaking == null) newLocale.populationSpeaking = 0;
        // Note this may double count populations when people speak multiple languages in the family
        newLocale.populationSpeaking += childLocale.populationSpeaking || 0;
        newLocale.populationSpeakingPercent =
          (newLocale.populationSpeaking * 100) / territory.population;
        newLocale.familyLocales = [...(newLocale.familyLocales || []), childLocale];

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

/**
 * Most locales are on the language + country level -- however it is useful to
 * have locales for the language family level as well. For instance, some import sources
 * report on the family level sometimes and its good to track the information in a locale artefact
 * that can be used to track official status, etc.
 *
 * Different sources may have different parent languages for a given language, so this is done for
 * the primary 2 sources Glottolog & ISO.
 */
export function createFamilyLocales2(locales: Record<string, LocaleData>): void {
  // Iterate through all locales and if there is a parent language for its language, then make a parent locale
  Object.values(locales).forEach((loc) => {
    // Filter our exceptional locales, we don't want to worry about those right now
    if (loc.variantTagCodes && loc.variantTagCodes.length > 0) return; // Skip variant locales
    if (loc.scriptCode) return; // Skip script-specific locales

    const { language, territory } = loc;
    const parentLanguage = language?.ISO.parentLanguage ?? language?.parentLanguage;

    if (!territory || !language) return;
    if (!parentLanguage || parentLanguage.ID.length > 3) return; // Skip glottolog languages for now

    // Create a new locale or update an existing family
    const newLocaleCode = `${parentLanguage.ID}_${loc.territoryCode}`;
    let newLocale = locales[newLocaleCode];
    if (newLocale == null) {
      // It isn't found yet, create it
      newLocale = {
        // Set a new locale code and territory code
        type: ObjectType.Locale,
        ID: newLocaleCode,
        codeDisplay: newLocaleCode,
        localeSource: LocaleSource.CreateFamilyLocales,

        // Add other parts of the locale code
        languageCode: parentLanguage.ID,
        language: parentLanguage,
        territoryCode: territory.ID,
        territory,
        scriptCode: loc.scriptCode, // should be undefined
        writingSystem: loc.writingSystem, // should be undefined
        variantTagCodes: loc.variantTagCodes != null ? [...loc.variantTagCodes] : [], // dereference the array
        variantTags: loc.variantTags != null ? [...loc.variantTags] : [], // dereference the array

        // Initialize the population
        populationSpeaking: loc.populationSpeaking,
        populationSpeakingPercent:
          loc.populationSpeaking != null
            ? (loc.populationSpeaking * 100) / territory.population
            : undefined,
        populationSource: PopulationSourceCategory.Aggregated,

        // Add stubs for required fields
        names: [],
        nameDisplay: newLocaleCode, // Will be computed later
        containedLocales: [loc], // Keep track of the original locales that were aggregated
      };

      // Create other edges
      locales[newLocaleCode] = newLocale;
      if (!parentLanguage.locales) parentLanguage.locales = [];
      parentLanguage.locales.push(locales[newLocaleCode]);
      if (!territory.locales) territory.locales = [];
      territory.locales.push(locales[newLocaleCode]);
    } else {
      // Add up population estimates
      // But only for locales that were created in this function
      if (loc.populationSpeaking != null && loc.localeSource === LocaleSource.CreateFamilyLocales) {
        if (newLocale.populationSpeaking == null) newLocale.populationSpeaking = 0;
        // Note this may double count populations when people speak multiple languages in the family
        newLocale.populationSpeaking += loc.populationSpeaking || 0;
        newLocale.populationSpeakingPercent =
          (newLocale.populationSpeaking * 100) / territory.population;
        newLocale.familyLocales = [...(newLocale.familyLocales || []), loc];
      }
    }
  });
}
