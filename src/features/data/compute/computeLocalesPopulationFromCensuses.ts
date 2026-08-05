import { CensusLanguageUse } from '@entities/census/CensusTypes';
import getPopulationSourceCategoryForCensus from '@entities/census/getPopulationSourceCategoryForCensus';
import getLanguageModalityDiscount from '@entities/language/population/getLanguageModalityDiscount';
import { LocaleData, LocaleInCensus } from '@entities/locale/LocaleTypes';

import computeCensusRecordPriority from './computeCensusRecordPriority';

export function computeLocalesPopulationFromCensuses(locales: LocaleData[]): void {
  // Find the best population estimate for each locale based on its population records
  locales.forEach((locale) => {
    const { censusRecords } = locale;
    if (!censusRecords || censusRecords.length === 0) {
      computePopulationWithoutCensusRecords(locale);
    } else {
      const bestRecordForSpeaking = [...censusRecords].sort(
        (a, b) =>
          computeCensusRecordPriority(b, 'speaking') - computeCensusRecordPriority(a, 'speaking'),
      )[0];
      const bestRecordForWriting = [...censusRecords].sort(
        (a, b) =>
          computeCensusRecordPriority(b, 'writing') - computeCensusRecordPriority(a, 'writing'),
      )[0];

      // Computes a discounted percentage and adjusted population number
      applyPopRecord(locale, bestRecordForSpeaking, 'speaking');
      applyPopRecord(locale, bestRecordForWriting, 'writing');
    }

    // Recompute the locale's specific literacy percent
    locale.literacyPercent =
      locale.pop.speaking.adjusted && locale.pop.writing.adjusted
        ? Math.min((locale.pop.writing.adjusted * 100) / locale.pop.speaking.adjusted, 100)
        : locale.territory?.literacyPercent;
  });
}

function computePopulationWithoutCensusRecords(locale: LocaleData): void {
  const { speaking, writing } = locale.pop;
  if (speaking.unadjusted == null) return; // Nothing to go from

  if (speaking.percent == null)
    speaking.percent = (speaking.unadjusted / (locale.territory?.pop.overall || 1)) * 100;
  speaking.modalityDiscount = getLanguageModalityDiscount(locale.language?.modality, 'speaking');
  speaking.percentAdjusted = speaking.percent * (speaking.modalityDiscount ?? 1);
  speaking.adjusted = speaking.unadjusted * (speaking.modalityDiscount ?? 1);

  if (writing.unadjusted == null) writing.unadjusted = speaking.unadjusted;
  if (writing.percent == null) writing.percent = speaking.percent;
  writing.literacyDiscount = (locale.territory?.literacyPercent ?? 100) / 100;
  writing.modalityDiscount = getLanguageModalityDiscount(locale.language?.modality, 'writing');
  writing.percentAdjusted =
    writing.percent * (writing.literacyDiscount ?? 1) * (writing.modalityDiscount ?? 1);
  writing.adjusted = (writing.percentAdjusted / 100.0) * (locale.territory?.pop.overall || 1);
}

function applyPopRecord(
  locale: LocaleData,
  record: LocaleInCensus,
  speakingOrWriting: 'speaking' | 'writing',
): void {
  const territory = locale.territory;
  const pop = locale.pop[speakingOrWriting];
  pop.census = record.census;
  pop.source = getPopulationSourceCategoryForCensus(record.census);
  pop.unadjusted = record.populationEstimate;

  // If the census record is not specifically about speaking a language, apply a discount factor
  // based on the regular medium of use and (for writing) the literacy rate of the territory
  if (!isRecordPrecise(record, speakingOrWriting)) {
    pop.literacyDiscount =
      speakingOrWriting === 'writing' ? (territory?.literacyPercent ?? 100) / 100 : undefined;
    pop.modalityDiscount = getLanguageModalityDiscount(
      locale.language?.modality,
      speakingOrWriting,
    );
  } else {
    pop.literacyDiscount = undefined;
    pop.modalityDiscount = undefined;
  }

  // Compute the percent, adjusted by the discount factors, and a corrected absolute population number
  pop.percent = record.populationPercent;
  pop.percentAdjusted = pop.percent * (pop.literacyDiscount ?? 1) * (pop.modalityDiscount ?? 1);
  pop.adjusted = Math.round((pop.percentAdjusted / 100.0) * (territory?.pop.overall || 1));
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
