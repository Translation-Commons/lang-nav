// Give population records a ranking based on various rules.
// Higher signifies that the record is more preferred.

import { CensusLanguageUse } from '@entities/census/CensusTypes';
import { LocaleInCensus } from '@entities/locale/LocaleTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

export type CensusRecordPriorityInfo = {
  factor: CensusPrioritizingFactor;
  score: number;
  weight: number;
};

export enum CensusPrioritizingFactor {
  LanguageUse = 'Language Use',
  YearCollected = 'Year Collected',
  AcquisitionOrder = 'Acquisition Order',
  Population = 'Population',
}

const DATA_WEIGHTS: Record<CensusPrioritizingFactor, number> = {
  [CensusPrioritizingFactor.LanguageUse]: 0.6,
  [CensusPrioritizingFactor.YearCollected]: 0.2,
  [CensusPrioritizingFactor.AcquisitionOrder]: 0.1, // Although this often overlaps with LanguageUse, its better as a tie-breaker
  [CensusPrioritizingFactor.Population]: 0.1,
};

function computeCensusRecordPriority(
  record: LocaleInCensus,
  focus: 'speaking' | 'writing',
): number {
  return buildCensusRecordPriorityInformation(record, focus).reduce(
    (total, { score, weight }) => total + score * weight,
    0,
  );
}

export function buildCensusRecordPriorityInformation(
  record: LocaleInCensus,
  focus: 'speaking' | 'writing',
): CensusRecordPriorityInfo[] {
  return Object.values(CensusPrioritizingFactor).map((dataType) => {
    const score = getCensusRecordSpecificPriority(record, focus, dataType);
    return { factor: dataType, score, weight: DATA_WEIGHTS[dataType] };
  });
}

// On a 0 to 1 scale, how much better does the signal make this record more
// useful to estimate the population than others?
// Negative values okay for exceptional cases, but generally the score should be positive.
function getCensusRecordSpecificPriority(
  record: LocaleInCensus,
  focus: 'speaking' | 'writing',
  dataType: CensusPrioritizingFactor,
): number {
  const { languageUse, yearCollected, acquisitionOrder } = record.census;
  switch (dataType) {
    case CensusPrioritizingFactor.LanguageUse:
      if (focus === 'speaking') {
        if (languageUse === CensusLanguageUse.Speaks) return 1;
        if (languageUse === CensusLanguageUse.Uses) return 0.5;
        if (languageUse === CensusLanguageUse.Understands) return 0.5;
        if (languageUse === CensusLanguageUse.Ethnicity) return 0.05;
      }
      if (focus === 'writing') {
        if (languageUse === CensusLanguageUse.Writes) return 1;
        if (languageUse === CensusLanguageUse.Uses) return 0.75;
        if (languageUse === CensusLanguageUse.Reads) return 0.5;
        if (languageUse === CensusLanguageUse.Ethnicity) return -0.05;
      }
      return 0;
    case CensusPrioritizingFactor.YearCollected:
      return (yearCollected - 2000) / 25; // 2025 -> 1, 2010 -> 0.4, 2000 -> 0, 1990 -> -0.4, 1980 -> -0.8
    case CensusPrioritizingFactor.AcquisitionOrder:
      if (acquisitionOrder === 'Any') return 1;
      if (acquisitionOrder === 'L1') return 0.5;
      if (acquisitionOrder === 'L2') return 0.25;
      if (acquisitionOrder === 'L3') return 0;
      return 0;
    case CensusPrioritizingFactor.Population:
      if (record.populationEstimate < 10) return -1; // It's probably just a "has population" signal, not a true estimate.
      return record.populationPercent / 100; // Tiebreaker, favor higher estimates
    default:
      enforceExhaustiveSwitch(dataType);
  }
}

export default computeCensusRecordPriority;
