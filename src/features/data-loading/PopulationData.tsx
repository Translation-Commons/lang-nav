import { getCensusCollectorTypeRank } from '@entities/census/CensusTypes';
import {
  isTerritoryGroup,
  LocaleData,
  LocaleInCensus,
  TerritoryData,
} from '@entities/types/DataTypes';

import { sumBy, uniqueBy } from '@shared/lib/setUtils';

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

  // Compute the adjusted population for each locale
  dataContext.locales.forEach((locale) => {
    if (locale.populationSpeakingPercent == null) {
      locale.populationAdjusted = locale.populationSpeaking;
    } else if (locale.populationSpeakingPercent === 0) {
      // console.log(locale);
      // locale.populationAdjusted = 0; skip
    } else {
      // Re-compute the adjusted population based on the latest territory population
      locale.populationAdjusted = Math.round(
        (locale.populationSpeakingPercent / 100.0) * (locale.territory?.population || 1),
      );
    }
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
    const uniqueContainedLocales = uniqueBy(
      locale.containedLocales ?? [],
      (loc) => loc.territoryCode || '',
    );

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

  // As a last step, if this is the World territory, update the language populations
  // This is safe because after recursion we should have computed everything else already.
  if (territory.ID === '001') {
    territory.locales
      ?.filter((l) => l.scriptCode == null && (l.variantTagCodes || []).length === 0)
      .forEach((locale) => {
        const language = locale.language;
        if (language == null || locale.populationAdjusted == null) return;
        language.populationFromLocales = locale.populationAdjusted;
        language.populationEstimate =
          Math.max(language.populationEstimate ?? 0, locale.populationAdjusted) || undefined;
      });
  }
}

export function computeLocaleWritingPopulation(locales: LocaleData[]): void {
  // Country & Dependencies have literacy values from the UN
  locales
    .filter(
      (l) => !isTerritoryGroup(l.territory?.scope), // Skip regional locales
    )
    .forEach((locale) => {
      locale.literacyPercent = locale.territory?.literacyPercent ?? 100;

      if (locale.populationSpeaking == null) return;
      locale.populationWriting = Math.round(
        (locale.populationSpeaking * locale.literacyPercent) / 100,
      );
      if (locale.populationSpeakingPercent != null) {
        locale.populationWritingPercent =
          (locale.populationSpeakingPercent * locale.literacyPercent) / 100;
      }
    });

  // Compute regional literacy by adding up the writing populations of the contained locales
  locales
    .filter((l) => isTerritoryGroup(l.territory?.scope))
    .forEach((locale) => {
      locale.populationWriting = sumBy(
        uniqueBy(locale.containedLocales ?? [], (loc) => loc.territoryCode || ''),
        (locale) => locale.populationWriting ?? 0,
      );
      if (locale.populationSpeaking && locale.populationWriting) {
        locale.literacyPercent = Math.round(
          (locale.populationWriting * 100) / locale.populationSpeaking,
        );
      }
    });
}
