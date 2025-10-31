import { getCensusCollectorTypeRank } from '@entities/census/CensusTypes';
import { LocaleData, LocaleInCensus } from '@entities/types/DataTypes';

type CensusCmp = (a: LocaleInCensus, b: LocaleInCensus) => number;

const POPULATION_ESTIMATE_RULES: CensusCmp[] = [
  // Potential filters:
  // acquisitionOrder: Any > L1 > L2 > L3

  // Prefer government sources over CLDR
  // Temporarily disabled
  (a, b) =>
    (getCensusCollectorTypeRank(a.census.collectorType) -
      getCensusCollectorTypeRank(b.census.collectorType)) *
    0,

  // Get the most recent census estimate
  // Temporarily disabled
  (a, b) => (b.census.yearCollected - a.census.yearCollected) * 0,

  // Just get the highest number
  (a, b) => b.populationPercent - a.populationPercent,
];

export function computeLocalePopulationFromCensuses(locales: LocaleData[]): void {
  // Find the best population estimate for each locale based on its census records
  locales.forEach((locale) => {
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
  locales.forEach((locale) => {
    if (locale.populationSpeakingPercent == null) {
      locale.populationAdjusted = locale.populationSpeaking;
    } else if (locale.populationSpeakingPercent === 0) {
      // locale.populationAdjusted = 0; skip
    } else {
      // Re-compute the adjusted population based on the latest territory population
      locale.populationAdjusted = Math.round(
        (locale.populationSpeakingPercent / 100.0) * (locale.territory?.population || 1),
      );
    }
  });
}

function setLocalePopulationEstimate(locale: LocaleData, record: LocaleInCensus): void {
  locale.populationSpeaking = record.populationEstimate;
  locale.populationSpeakingPercent = record.populationPercent;
  locale.populationCensus = record.census;
}
