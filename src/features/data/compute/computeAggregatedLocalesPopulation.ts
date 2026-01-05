import {
  isTerritoryGroup,
  LocaleData,
  LocaleSource,
  TerritoryData,
} from '@entities/types/DataTypes';

import { sumBy, uniqueBy } from '@shared/lib/setUtils';

/**
 * Computes the population for regional locales by aggregating populations from their contained locales.
 * This function should be called starting from the world territory (ID '001') and will recursively
 * compute populations for all contained territories and their locales.
 */
export function computeRegionalLocalesPopulation(territory: TerritoryData | undefined): void {
  if (territory == null || !isTerritoryGroup(territory.scope)) {
    return; // Only recompute for regional locales
  }
  // Re-compute the estimate for the contained territories first.
  territory.containsTerritories?.forEach((childTerritory) => {
    computeRegionalLocalesPopulation(childTerritory);
  });
  // Now go through the locales and re-compute their population
  territory.locales?.forEach((locale) => {
    // For these locales, sometimes there are multiple contained locales with the same territory code like zh_Hans_SG and zh_Hant_SG
    // so get only unique locales
    const relatedLocales = locale.relatedLocales;
    if (!relatedLocales) return;
    const uniqueContainedLocales = uniqueBy(
      (locale.relatedLocales?.childTerritories ?? []).sort(
        (a, b) => (b.populationAdjusted || 0) - (a.populationAdjusted || 0),
      ),
      (loc) => loc.territoryCode || '',
    ).filter((loc) => loc.territoryCode !== '');

    // Add up the adjusted population of unique contained locales (eg don't double count
    // zh_Hans_SG and zh_Hant_SG). The adjusted population is corrected to the current year
    // to smooth out population growth between data collected in different years.
    relatedLocales.sumOfPopulationFromChildTerritories =
      sumBy(uniqueContainedLocales, (loc) => loc.populationAdjusted) || undefined;
    locale.populationAdjusted = relatedLocales.sumOfPopulationFromChildTerritories;
    // Set population speaking to be the sum of the unadjusted population
    locale.populationSpeaking =
      sumBy(uniqueContainedLocales, (loc) => loc.populationSpeaking || 0) || undefined;

    // Compute the percent based on the adjusted population for regional locales.
    if (locale.populationAdjusted) {
      locale.populationSpeakingPercent =
        (locale.populationAdjusted / (territory.population || 1)) * 100;
    }
  });
}

export function computeLanguageFamilyLocalePopulations(locales: LocaleData[]): void {
  // For all root locales
  locales
    .filter((loc) => !loc.relatedLocales?.parentLanguage)
    .forEach((rootLocale) => getLanguageFamilyLocalePopulation(rootLocale));
}

function getLanguageFamilyLocalePopulation(locale: LocaleData): void {
  // Re-compute the estimate for the child languages first.
  const relatedLocales = locale.relatedLocales || {};
  if (!relatedLocales.childLanguages) return;
  const { childLanguages } = relatedLocales;
  childLanguages?.forEach((locale) => getLanguageFamilyLocalePopulation(locale));

  // Get the child locales, unique by language code to avoid double counting (eg. zh-Hans-SG and zh-Hant-SG)
  const uniqueChildLocales = uniqueBy(
    (childLanguages || []).sort(
      (a, b) => (b.populationAdjusted || 0) - (a.populationAdjusted || 0),
    ),
    (loc) => loc.languageCode,
  );
  relatedLocales.sumOfPopulationFromChildLanguages =
    sumBy(uniqueChildLocales, (childLocale) => childLocale.populationAdjusted) || undefined;

  // If the locale is for a language family, set its population to the sum of its children's populations
  if (
    locale.localeSource === LocaleSource.CreateFamilyLocales &&
    relatedLocales.sumOfPopulationFromChildLanguages
  ) {
    const percentOfTerritory =
      (relatedLocales.sumOfPopulationFromChildLanguages * 100) /
      (locale.territory?.population || 1);
    if (percentOfTerritory > 100) {
      locale.populationAdjusted = locale.territory?.population;
      locale.populationSpeakingPercent = 100;
    } else {
      locale.populationAdjusted = relatedLocales.sumOfPopulationFromChildLanguages;
      locale.populationSpeakingPercent = percentOfTerritory;
    }
  }
}
