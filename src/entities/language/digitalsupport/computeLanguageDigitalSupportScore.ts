import { CLDRCoverageLevel } from '@entities/types/CLDRTypes';
import { EntityType } from '@entities/types/EntityTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';
import { sumBy } from '@shared/lib/setUtils';

import type { LanguageData } from '../LanguageTypes';

import {
  getExpectedCountOfPlatforms,
  getTechsForLanguage,
} from './computeLanguageDigitalSupportStatus';
import {
  DigitalSupportDimension,
  DigitalSupportScore,
  getTechScopeForSupportDim,
  WikipediaStatus,
} from './DigitalSupportTypes';

export function computeDigitalSupportScores(lang: LanguageData): DigitalSupportScore | undefined {
  const constituentDimensions = Object.values(DigitalSupportDimension).filter(
    (dim) => dim !== DigitalSupportDimension.Overall,
  );
  const scores = Object.fromEntries(
    constituentDimensions.map((dimension) => [
      dimension,
      computeDigitalSupportScore(lang, dimension),
    ]),
  );
  scores.overall =
    constituentDimensions.map((dimension) => scores[dimension] ?? 0).reduce((a, b) => a + b, 0) /
    constituentDimensions.length;

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
          computeDigitalSupportScore(lang, DigitalSupportDimension.MachineTranslation) +
          computeDigitalSupportScore(lang, DigitalSupportDimension.AI)) /
        6
      );
    case DigitalSupportDimension.Documentation:
      return (lang.udhr?.length ? 5 : 0) + computeWikipediaScore(lang);
    case DigitalSupportDimension.Keyboards:
      return lang.keyboards?.length ? 10 : 0;
    case DigitalSupportDimension.I18nFrameworks:
      return computeCLDRScore(lang);
    case DigitalSupportDimension.Interfaces:
    case DigitalSupportDimension.AI:
    case DigitalSupportDimension.MachineTranslation:
      return (
        sumBy(getTechsForLanguage(lang, getTechScopeForSupportDim(dimension)), ({ entries }) =>
          entries.length > 0 ? 1 : 0,
        ) *
        (10 / getExpectedCountOfPlatforms(dimension))
      );
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
