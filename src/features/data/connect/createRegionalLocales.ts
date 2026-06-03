import { LocaleSeparator, ObjectType } from '@features/params/PageParamTypes';

import { getLocaleCode } from '@entities/locale/LocaleParsing';
import {
  LocaleData,
  LocaleSource,
  PopulationSourceCategory,
  StandardLocaleCode,
} from '@entities/locale/LocaleTypes';
import { isTerritoryGroup, TerritoryCode, TerritoryData } from '@entities/territory/TerritoryTypes';

/**
 * Locale input data is contained to countries and dependencies -- this adds up data from
 * the smaller territories to create regional locales.
 */
export function createRegionalLocales(
  territories: Record<TerritoryCode, TerritoryData>,
  locales: Record<StandardLocaleCode, LocaleData>,
): void {
  // Start with the world and recursively create locales for all territory groups
  createRegionalLocalesForTerritory(territories['001'], locales);
}

function createRegionalLocalesForTerritory(
  territory: TerritoryData,
  allLocales: Record<StandardLocaleCode, LocaleData>,
): void {
  if (!territory) return;

  // Make sure that territories within are processed first
  const containsTerritories = territory.containsTerritories ?? [];
  containsTerritories?.forEach((t) => createRegionalLocalesForTerritory(t, allLocales));

  if (!isTerritoryGroup(territory.scope)) {
    return; // Only going this for regions/continents
  }

  const territoryLocales = containsTerritories?.reduce<Record<StandardLocaleCode, LocaleData>>(
    (locs, childTerritory) => {
      childTerritory.locales?.forEach((loc) => {
        const newLocaleCode = getLocaleCode(loc, LocaleSeparator.Underscore, territory.ID);
        const newLocale = locs[newLocaleCode];
        if (newLocale == null) {
          const percent =
            loc.pop.speaking.unadjusted != null
              ? (loc.pop.speaking.unadjusted * 100) / territory.population
              : undefined;
          // It isn't found yet, create it
          locs[newLocaleCode] = {
            // Set a new locale code and territory code
            type: ObjectType.Locale,
            ID: newLocaleCode,
            codeDisplay: newLocaleCode,
            localeSource: LocaleSource.CreateRegionalLocales,

            // Recognize the new region territory
            territoryCode: territory.ID,
            territory,

            // Add other parts of the locale code
            languageCode: loc.languageCode,
            language: loc.language,
            scriptCode: loc.scriptCode,
            writingSystem: loc.writingSystem,
            variantCodes: loc.variantCodes != null ? [...loc.variantCodes] : [], // dereference the array
            variants: loc.variants != null ? [...loc.variants] : [], // dereference the array

            // Update the population
            pop: {
              speaking: {
                unadjusted: loc.pop.speaking.unadjusted,
                percent,
                source: PopulationSourceCategory.AggregatedFromTerritories,
              },
              writing: {},
            },

            // Add stubs for required fields
            names: [],
            nameDisplay: newLocaleCode, // Will be computed later
          };
        } else {
          if (loc.pop.speaking.unadjusted != null) {
            if (newLocale.pop.speaking.unadjusted == null) newLocale.pop.speaking.unadjusted = 0;
            newLocale.pop.speaking.unadjusted += loc.pop.speaking.unadjusted || 0;
            newLocale.pop.speaking.percent =
              (newLocale.pop.speaking.unadjusted * 100) / territory.population;
          }
        }
      });
      return locs;
    },
    {},
  );

  // Save it to the territory
  territory.locales = Object.values(territoryLocales ?? {})
    // Avoid creating too many locale objects
    .filter((loc) => (loc.pop.speaking.unadjusted ?? 0) > 10)
    // Don't use sortByPopulation because that uses the adjusted pop
    .sort((a, b) => (b.pop.speaking.unadjusted || 0) - (a.pop.speaking.unadjusted || 0));

  // Connect locale edges
  territory.locales.forEach((loc) => {
    // Add the new locale to the master list
    allLocales[loc.ID] = loc;
    // Also add the locale to the language's locale list
    if (loc.language) loc.language.locales.push(loc);
  });
}
