import { isTerritoryGroup, TerritoryData } from '@entities/types/DataTypes';

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
    const uniqueContainedLocales = uniqueBy(
      (locale.containedLocales ?? []).sort(
        (a, b) => (b.populationAdjusted || 0) - (a.populationAdjusted || 0),
      ),
      (loc) => loc.territoryCode || '',
    ).filter((loc) => loc.territoryCode !== '');

    // Adjusted population comes from the sum of the contained locales
    locale.populationAdjusted =
      sumBy(
        uniqueContainedLocales,
        // Each absolute number may come from a different year, so instead of adding up censuses from
        // potentially different years, we use the population percent of the contained locales
        // and compute the current population based on the latest population of the territory.
        (loc) => loc.populationAdjusted,
      ) || undefined;
    // Since this is regional locales, we set the speaking population and percent accordingly
    locale.populationSpeaking =
      sumBy(uniqueContainedLocales, (loc) => loc.populationSpeaking || 0) || undefined;

    // Compute the percent based on the adjusted population for regional locales.
    if (locale.populationAdjusted) {
      locale.populationSpeakingPercent =
        (locale.populationAdjusted / (territory.population || 1)) * 100;
    }
  });
}
