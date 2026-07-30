import { CensusLanguageUse } from '@entities/census/CensusTypes';
import getLanguageModalityDiscount from '@entities/language/population/getLanguageModalityDiscount';
import { LocaleData, LocaleInCensus } from '@entities/locale/LocaleTypes';

// Give population records a ranking based on various rules
// That separately should add up to a value between 0 and 1, depending on the weight we want to give it.
// Higher signifies that the record is more preferred
export function getPopulationRecordRank(
  record: LocaleInCensus,
  use: 'speaking' | 'writing',
): number {
  const { languageUse, yearCollected, acquisitionOrder } = record.census;
  let rank = 0;
  // The biggest source is what kind of data the census proports to have.
  if (use === 'speaking') {
    rank += languageUse === CensusLanguageUse.Speaks ? 1 : 0;
    rank += languageUse === CensusLanguageUse.Uses ? 0.5 : 0;
    rank += languageUse === CensusLanguageUse.Understands ? 0.5 : 0;
    rank += languageUse === CensusLanguageUse.Ethnicity ? 0.05 : 0;
  } else if (use === 'writing') {
    rank += languageUse === CensusLanguageUse.Writes ? 1 : 0;
    rank += languageUse === CensusLanguageUse.Uses ? 0.75 : 0;
    rank += languageUse === CensusLanguageUse.Reads ? 0.5 : 0;
    rank += languageUse === CensusLanguageUse.Ethnicity ? -0.05 : 0;
  }
  // Then we have other factors that are less important, mostly for tie-breaking.
  // rank += (6 - getCensusCollectorTypeRank(record.census.collectorType)) / 6;
  rank += (yearCollected - 2000) / 20;
  if (acquisitionOrder === 'Any') rank += 0.12;
  if (acquisitionOrder === 'L1') rank += 0.1;
  if (acquisitionOrder === 'L2') rank += 0.05;
  if (acquisitionOrder === 'L3') rank += 0;
  rank += record.populationPercent / 100.0 / 10;
  return rank;
}

export function computeLocalesPopulationFromCensuses(locales: LocaleData[]): void {
  // Find the best population estimate for each locale based on its population records
  locales.map((locale) => {
    const { censusRecords } = locale;
    if (!censusRecords || censusRecords.length === 0) {
      computePopulationWithoutCensusRecords(locale);
      return;
    }

    const bestRecordForSpeaking = [...censusRecords].sort(
      (a, b) => getPopulationRecordRank(b, 'speaking') - getPopulationRecordRank(a, 'speaking'),
    )[0];
    const bestRecordForWriting = [...censusRecords].sort(
      (a, b) => getPopulationRecordRank(b, 'writing') - getPopulationRecordRank(a, 'writing'),
    )[0];

    // Computes a discounted percentage and adjusted population number
    applyPopRecord(locale, bestRecordForSpeaking, 'speaking');
    applyPopRecord(locale, bestRecordForWriting, 'writing');
  });
}

function computePopulationWithoutCensusRecords(locale: LocaleData): void {
  const { speaking, writing } = locale.pop;
  if (speaking.unadjusted == null) return; // Nothing to go from

  if (speaking.percent == null)
    speaking.percent = (speaking.unadjusted / (locale.territory?.population || 1)) * 100;
  speaking.modalityDiscount = getLanguageModalityDiscount(locale.language?.modality, 'speaking');
  speaking.percentAdjusted = speaking.percent * (speaking.modalityDiscount ?? 1);
  speaking.adjusted = speaking.unadjusted * (speaking.modalityDiscount ?? 1);

  if (writing.percent == null) return; // Nothing to go from
  writing.literacyDiscount = (locale.territory?.literacyPercent ?? 100) / 100;
  writing.modalityDiscount = getLanguageModalityDiscount(locale.language?.modality, 'writing');
  writing.percentAdjusted =
    writing.percent * (writing.literacyDiscount ?? 1) * (writing.modalityDiscount ?? 1);
  writing.adjusted = (writing.percentAdjusted / 100.0) * (locale.territory?.population || 1);
}

function applyPopRecord(
  locale: LocaleData,
  record: LocaleInCensus,
  use: 'speaking' | 'writing',
): void {
  const territory = locale.territory;
  const pop = locale.pop[use];
  pop.census = record.census;
  pop.unadjusted = record.populationEstimate;

  // If the census record is not specifically about speaking a language, apply a discount factor
  // based on the regular medium of use and (for writing) the literacy rate of the territory
  if (!isRecordPrecise(record, use)) {
    pop.literacyDiscount =
      use === 'writing' ? (territory?.literacyPercent ?? 100) / 100 : undefined;
    pop.modalityDiscount = getLanguageModalityDiscount(locale.language?.modality, use);
  } else {
    pop.literacyDiscount = undefined;
    pop.modalityDiscount = undefined;
  }

  // Compute the percent, adjusted by the discount factors, and a corrected absolute population number
  pop.percent = record.populationPercent;
  pop.percentAdjusted = pop.percent * (pop.literacyDiscount ?? 1) * (pop.modalityDiscount ?? 1);
  pop.adjusted = Math.round((pop.percentAdjusted / 100.0) * (territory?.population || 1));
}

function isRecordPrecise(record: LocaleInCensus, use: 'speaking' | 'writing'): boolean {
  if (use === 'speaking') {
    return record.census.languageUse === CensusLanguageUse.Speaks;
  }
  // if (use === 'writing') {
  return (
    // For now, counting any of these
    record.census.languageUse === CensusLanguageUse.Writes ||
    record.census.languageUse === CensusLanguageUse.Reads
  );
}
