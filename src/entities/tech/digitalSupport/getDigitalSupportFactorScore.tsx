import type { LanguageData } from '@entities/language/LanguageTypes';
import { CLDRCoverageLevel } from '@entities/types/CLDRTypes';
import { EntityType } from '@entities/types/EntityTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';
import { sumBy } from '@shared/lib/setUtils';

import { computeBooksPublishedScores } from './DigitalSupportBooksPublished';
import { DigitalSupportFactor } from './DigitalSupportTypes';
import { getUnicodeEncodingScore } from './DigitalSupportUnicodeEncoding';
import { computeWikipediaScore } from './DigitalSupportWikipedia';

// Returns a numeric score from 1 to 100
function getDigitalSupportFactorScore(ent: LanguageData, factor: DigitalSupportFactor): number {
  switch (factor) {
    // Communication
    case DigitalSupportFactor.UnicodeEncoding:
      return getUnicodeEncodingScore(ent);

    case DigitalSupportFactor.Keyman:
      return ent.keyboards?.filter((kb) => kb.inputTechCode === 'Keyman').length ? 100 : 0;
    case DigitalSupportFactor.Gboard:
      return ent.keyboards?.filter((kb) => kb.inputTechCode === 'GBoard').length ? 100 : 0;

    case DigitalSupportFactor.Grammarly:
      return getTechSupportScore(ent, 'Grammarly');
    case DigitalSupportFactor.QuillBot:
      return getTechSupportScore(ent, 'Quillbot');
    case DigitalSupportFactor.LanguageTool:
      return getTechSupportScore(ent, 'LanguageTool');

    // Content
    case DigitalSupportFactor.BooksPublishedAnnually:
      return computeBooksPublishedScores(ent.booksEst, ent.pop.overall).score;
    case DigitalSupportFactor.Wikipedia:
      return computeWikipediaScore(ent);
    case DigitalSupportFactor.UDHR:
      return ent.udhr?.length ? 100 : 0;

    case DigitalSupportFactor.CLDR:
      return computeCLDRScore(ent);
    case DigitalSupportFactor.ICU:
      if (ent.CLDR.coverage?.inICU) return 100;
      if (
        ent.CLDR.dataProvider?.type === EntityType.Language &&
        ent.CLDR.dataProvider?.CLDR.coverage?.inICU
      )
        return 100;
      return 0;

    case DigitalSupportFactor.GTranslate:
      return getTechSupportScore(ent, 'GTranslate');
    case DigitalSupportFactor.MSTranslator:
      return getTechSupportScore(ent, 'MS Translator');

    // Interfaces
    case DigitalSupportFactor.Android:
      return getTechSupportScore(ent, 'Android');
    case DigitalSupportFactor.iOS:
      return getTechSupportScore(ent, 'iOS');
    case DigitalSupportFactor.macOS:
      return getTechSupportScore(ent, 'macOS');
    case DigitalSupportFactor.Win11:
      return getTechSupportScore(ent, 'win11');

    case DigitalSupportFactor.Facebook:
      return getAggregatedTechScore(ent, ['fbweb', 'fb4a', 'fblite', 'fbios']);
    case DigitalSupportFactor.Instagram:
      return getAggregatedTechScore(ent, ['igweb', 'ig4a', 'igios']);

    case DigitalSupportFactor.ClaudeSonnet:
      return getTechSupportScore(ent, 'Claude');

    default:
      enforceExhaustiveSwitch(factor);
  }
}

function getAggregatedTechScore(ent: LanguageData, techShortNames: string[]): number {
  const scores = techShortNames.map((name) => getTechSupportScore(ent, name));
  return sumBy(scores, (s) => s) / scores.length;
}

function getTechSupportScore(ent: LanguageData, techShortName: string): number {
  const techSupport = ent.techSupport?.filter((ts) => ts.techShortName === techShortName);
  const techScores =
    techSupport?.map((ts) =>
      ts.level != null ? (ts.tech.maxLevel ? ts.level / ts.tech.maxLevel : 1) : 1,
    ) ?? [];
  return techScores.length ? Math.max(...techScores) * 100 : 0;
}

export function computeCLDRScore(lang: LanguageData): number {
  const {
    CLDR: { coverage, dataProvider },
  } = lang;
  if (coverage == null) {
    if (dataProvider?.type == EntityType.Language && dataProvider.CLDR.coverage != null)
      return computeCLDRScore(dataProvider);
    return 0;
  }
  if (coverage.actualCoverageLevel === CLDRCoverageLevel.Modern) return 100;
  if (coverage.actualCoverageLevel === CLDRCoverageLevel.Moderate) return 75;
  if (coverage.actualCoverageLevel === CLDRCoverageLevel.Basic) return 50;
  if (coverage.actualCoverageLevel === CLDRCoverageLevel.Core) return 25;
  return 0;
}

export default getDigitalSupportFactorScore;
