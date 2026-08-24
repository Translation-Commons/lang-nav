import { EntityType } from '@features/params/PageParamTypes';

import { CLDRCoverageLevel } from '@entities/types/CLDRTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

import { LanguageData } from '../LanguageTypes';

import {
  DigitalSupportDimension,
  DigitalSupportScore,
  WikipediaStatus,
} from './DigitalSupportTypes';

const CONSTITUENT_SCORES = [
  DigitalSupportDimension.Documentation,
  DigitalSupportDimension.Interfaces,
  DigitalSupportDimension.Keyboards,
  DigitalSupportDimension.I18nFrameworks,
  DigitalSupportDimension.MachineTranslation,
];

export function computeDigitalSupportScores(lang: LanguageData): DigitalSupportScore | undefined {
  const scores = Object.fromEntries(
    CONSTITUENT_SCORES.map((dimension) => [dimension, computeDigitalSupportScore(lang, dimension)]),
  );
  scores.overall =
    CONSTITUENT_SCORES.map((dimension) => scores[dimension] ?? 0).reduce((a, b) => a + b, 0) /
    CONSTITUENT_SCORES.length;

  if (scores.overall === 0) return undefined;
  return scores as Record<DigitalSupportDimension, number>;
}

function computeDigitalSupportScore(
  lang: LanguageData,
  dimension: DigitalSupportDimension,
): number {
  switch (dimension) {
    case DigitalSupportDimension.Overall:
      return (
        (computeDigitalSupportScore(lang, DigitalSupportDimension.Documentation) +
          computeDigitalSupportScore(lang, DigitalSupportDimension.Interfaces) +
          computeDigitalSupportScore(lang, DigitalSupportDimension.Keyboards) +
          computeDigitalSupportScore(lang, DigitalSupportDimension.I18nFrameworks) +
          computeDigitalSupportScore(lang, DigitalSupportDimension.MachineTranslation)) /
        5
      );
    case DigitalSupportDimension.Documentation:
      return (lang.udhr?.length ? 5 : 0) + computeWikipediaScore(lang);
    case DigitalSupportDimension.Interfaces:
      return (
        ((lang.win11LanguagePacks?.length ? 1 : 0) +
          (lang.ios?.length ? 1 : 0) +
          (lang.macos?.length ? 1 : 0)) *
        (10 / 3)
      );
    case DigitalSupportDimension.Keyboards:
      return lang.keyboards?.length ? 10 : 0;
    case DigitalSupportDimension.I18nFrameworks:
      return computeCLDRScore(lang);
    case DigitalSupportDimension.MachineTranslation:
      return lang.googleTranslate?.length ? 10 : 0; // Placeholder, replace with actual logic
    default:
      enforceExhaustiveSwitch(dimension);
  }
}

// 0-5
function computeWikipediaScore(lang: LanguageData): number {
  const { wikipedias } = lang;
  if (!wikipedias || wikipedias.length === 0) return 0;
  if (wikipedias.some((wiki) => wiki.status === WikipediaStatus.Active)) return 5;
  if (wikipedias.some((wiki) => wiki.status === WikipediaStatus.Incubator)) return 2; // incubator
  return 1; // deleted (WikipediaStatus.Closed)
}

function computeCLDRScore(lang: LanguageData): number {
  const {
    CLDR: { coverage, dataProvider },
  } = lang;
  if (coverage == null) {
    if (dataProvider?.type == EntityType.Language && dataProvider.CLDR.coverage != null)
      return computeCLDRScore(dataProvider);
    return 0;
  }
  if (coverage.actualCoverageLevel === CLDRCoverageLevel.Modern) return 10;
  if (coverage.actualCoverageLevel === CLDRCoverageLevel.Moderate) return 8;
  if (coverage.actualCoverageLevel === CLDRCoverageLevel.Basic) return 5;
  if (coverage.actualCoverageLevel === CLDRCoverageLevel.Core) return 2;
  return 0;
}
