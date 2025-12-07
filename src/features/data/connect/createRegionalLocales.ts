import { LocaleSeparator, ObjectType } from '@features/params/PageParamTypes';

import { getLocaleCode } from '@entities/locale/LocaleParsing';
import {
  BCP47LocaleCode,
  isTerritoryGroup,
  LocaleData,
  LocaleSource,
  PopulationSourceCategory,
  TerritoryCode,
  TerritoryData,
} from '@entities/types/DataTypes';

/**
 * Locale input data is contained to countries and dependencies -- this adds up data from
 * the smaller territories to create regional locales.
 */
export function createRegionalLocales(
  territories: Record<TerritoryCode, TerritoryData>,
  locales: Record<BCP47LocaleCode, LocaleData>,
): void {
  // Start with the world and recursively create locales for all territory groups
  createRegionalLocalesForTerritory(territories['001'], locales);
}

function createRegionalLocalesForTerritory(
  territory: TerritoryData,
  allLocales: Record<BCP47LocaleCode, LocaleData>,
): void {
  if (!territory) return;

  // Make sure that territories within are processed first
  const containsTerritories = territory.containsTerritories ?? [];
  containsTerritories?.forEach((t) => createRegionalLocalesForTerritory(t, allLocales));

  if (!isTerritoryGroup(territory.scope)) {
    return; // Only going this for regions/continents
  }

  const territoryLocales = containsTerritories?.reduce<Record<BCP47LocaleCode, LocaleData>>(
    (locs, childTerritory) => {
      childTerritory.locales?.forEach((childLocale) => {
        const newLocaleCode = getLocaleCode(childLocale, LocaleSeparator.Underscore, territory.ID);
        let newLocale = locs[newLocaleCode];
        if (newLocale == null) {
          // It isn't found yet, create it
          newLocale = {
            // Set a new locale code and territory code
            type: ObjectType.Locale,
            ID: newLocaleCode,
            codeDisplay: newLocaleCode,
            localeSource: LocaleSource.CreateRegionalLocales,

            // Recognize the new region territory
            territoryCode: territory.ID,
            territory,

            // Add other parts of the locale code
            languageCode: childLocale.languageCode,
            language: childLocale.language,
            scriptCode: childLocale.scriptCode,
            writingSystem: childLocale.writingSystem,
            variantTagCodes:
              childLocale.variantTagCodes != null ? [...childLocale.variantTagCodes] : [], // dereference the array
            variantTags: childLocale.variantTags != null ? [...childLocale.variantTags] : [], // dereference the array

            // Update the population
            populationSpeaking: childLocale.populationSpeaking,
            populationSpeakingPercent:
              childLocale.populationSpeaking != null
                ? (childLocale.populationSpeaking * 100) / territory.population
                : undefined,
            populationSource: PopulationSourceCategory.AggregatedFromTerritories,

            // Add stubs for required fields
            names: [],
            nameDisplay: newLocaleCode, // Will be computed later
            localesWithinThisTerritory: [childLocale], // Keep track of the original locales that were aggregated
          };

          // Add edges
          locs[newLocaleCode] = newLocale;
        } else {
          if (childLocale.populationSpeaking != null) {
            if (newLocale.populationSpeaking == null) newLocale.populationSpeaking = 0;
            newLocale.populationSpeaking += childLocale.populationSpeaking || 0;
            newLocale.populationSpeakingPercent =
              (newLocale.populationSpeaking * 100) / territory.population;
            newLocale.localesWithinThisTerritory = [
              ...(newLocale.localesWithinThisTerritory || []),
              childLocale,
            ];
          }
        }
        childLocale.localeForParentTerritory = newLocale;
      });
      return locs;
    },
    {},
  );

  // Save it to the territory
  territory.locales = Object.values(territoryLocales ?? {})
    .filter((loc) => (loc.populationSpeaking ?? 0) > 10) // Avoid creating too many locale objects
    .sort((a, b) => (b.populationSpeaking ?? 0) - (a.populationSpeaking ?? 0));

  // Connect locale edges
  territory.locales.forEach((loc) => {
    // Add the new locale to the master list
    allLocales[loc.ID] = loc;
    // Also add the locale to the language's locale list
    if (loc.language) loc.language.locales.push(loc);
  });
}
