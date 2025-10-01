import { getCensusCollectorTypeRank } from '../types/CensusTypes';
import { isTerritoryGroup, LocaleData, LocaleInCensus, TerritoryData } from '../types/DataTypes';

import { DataContextType } from './DataContext';

type CensusCmp = (a: LocaleInCensus, b: LocaleInCensus) => number;

const POPULATION_ESTIMATE_RULES: CensusCmp[] = [
  // Potential filters:
  // acquisitionOrder: Any > L1 > L2 > L3

  // Prefer government sources over CLDR
  (a, b) =>
    getCensusCollectorTypeRank(a.census.collectorType) -
    getCensusCollectorTypeRank(b.census.collectorType),

  // Get the most recent census estimate
  (a, b) => b.census.yearCollected - a.census.yearCollected,

  // Just get the highest number
  (a, b) => b.populationPercent - a.populationPercent,
];

export function computeLocalePopulationFromCensuses(dataContext: DataContextType): void {
  dataContext.locales.forEach((locale) => {
    if (!locale.censusRecords || locale.censusRecords.length === 0) return; // No census records, nothing to compute
    let records = [...locale.censusRecords];

    // Apply a series of rules to determine the best population estimate.
    for (const rule of POPULATION_ESTIMATE_RULES) {
      records = records.sort(rule);
      // Filter the records to ones that match the first one
      const bestRecords = records.filter((otherRecord) => rule(records[0], otherRecord) === 0);
      if (bestRecords.length === 1) {
        // If we have a single best record, use it
        setLocalePopulationEstimate(locale, bestRecords[0]);
        return; // We found a unique best estimate
      } else if (bestRecords.length > 1) {
        // If we have multiple records that match, we need to apply more rules
        records = bestRecords; // Narrow down to these records for the next rule
      } // otherwise record length is 0 but that should not be possible since we are filtering to the first record
    }
    // All rules exhausted, just take the first record as the best estimate
    setLocalePopulationEstimate(locale, records[0]);
  });

  // Re-compute the population for regional locales
  // Start with the world territory (001) and then go down to groups
  recomputeRegionalLocalePopulation(dataContext.getTerritory('001'));
}

function setLocalePopulationEstimate(locale: LocaleData, record: LocaleInCensus): void {
  locale.populationSpeaking = record.populationEstimate;
  locale.populationSpeakingPercent = record.populationPercent;
  locale.populationCensus = record.census;
}

// This re-computes regional locales (eg. es_419, Spanish in Latin America).
function recomputeRegionalLocalePopulation(territory: TerritoryData | undefined): void {
  if (territory == null || !isTerritoryGroup(territory.scope)) {
    return; // Only recompute for regional locales
  }
  // Re-compute the estimate for the contained territories first.
  territory.containsTerritories?.forEach((childTerritory) => {
    recomputeRegionalLocalePopulation(childTerritory);
  });
  // Now go through the locales and re-compute their population
  territory.locales?.forEach((locale) => {
    locale.populationSpeaking =
      locale.containedLocales?.reduce(
        // Each absolute number may come from a different year, so instead of adding up censuses from
        // potentially different years, we use the population percent of the contained locales
        // and compute the current population based on the latest population of the territory.
        (sum, loc) =>
          sum +
          Math.round(
            ((loc.populationSpeakingPercent || 0) * (loc.territory?.population || 0)) / 100,
          ),
        0,
      ) || 0;
    // The percent needs to be aggregated relative to the size of the child territory in the parent territory
    locale.populationSpeakingPercent =
      locale.containedLocales?.reduce(
        (sum, loc) =>
          sum +
          Math.round(
            ((loc.populationSpeakingPercent || 0) * (loc.territory?.population || 0)) /
              territory.population,
          ),
        0,
      ) || 0;
  });
}

export function computeLocaleWritingPopulation(locales: LocaleData[]): void {
  locales
    .filter(
      (l) => !isTerritoryGroup(l.territory?.scope), // Skip regional locales
    )
    .forEach((locale) => {
      locale.literacyPercent = locale.territory?.literacyPercent ?? 100;

      locale.populationWriting = Math.round(
        (locale.populationSpeaking * locale.literacyPercent) / 100,
      );
      if (locale.populationSpeakingPercent != null) {
        locale.populationWritingPercent =
          (locale.populationSpeakingPercent * locale.literacyPercent) / 100;
      }
    });
}
