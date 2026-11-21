import { WikipediaStatus } from '@entities/language/digitalsupport/DigitalSupportTypes';
import type { LanguageData } from '@entities/language/LanguageTypes';
import { CLDRCoverageLevel } from '@entities/types/CLDRTypes';
import { EntityType } from '@entities/types/EntityTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

import { computeBooksPublishedScores } from './DigitalSupportBooksPublished';
import { DigitalSupportFactor } from './DigitalSupportTypes';

// Returns a numeric score from 1 to 10
function getDigitalSupportFactorScore(ent: LanguageData, factor: DigitalSupportFactor): number {
  switch (factor) {
    // Communication
    case DigitalSupportFactor.UnicodeEncoding:
      return getUnicodeEncodingScore(ent);

    case DigitalSupportFactor.Keyman:
      return ent.keyboards?.filter((kb) => kb.inputTechCode === 'Keyman').length ? 10 : 0;
    case DigitalSupportFactor.Gboard:
      return ent.keyboards?.filter((kb) => kb.inputTechCode === 'GBoard').length ? 10 : 0;

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
      return ent.udhr?.length ? 10 : 0;

    case DigitalSupportFactor.CLDR:
      return computeCLDRScore(ent);

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

    case DigitalSupportFactor.ClaudeSonnet:
      return getTechSupportScore(ent, 'Claude');

    default:
      enforceExhaustiveSwitch(factor);
  }
}

function getTechSupportScore(ent: LanguageData, techShortName: string): number {
  const techSupport = ent.techSupport?.filter((ts) => ts.techShortName === techShortName);
  const techScores = techSupport?.map((ts) => ts.score ?? 1) ?? [];
  return techScores.length ? Math.max(...techScores) * 10 : 0;
}

function getUnicodeEncodingScore(lang: LanguageData): number {
  // Check if the primary writing system is unicode encoded
  const primaryEncoded = !!lang.primaryWritingSystem?.unicodeVersion;
  if (primaryEncoded) return 10;

  // Otherwise check alternative writing systems
  const otherWritingSystems = Object.values(lang.writingSystems ?? {});
  const otherEncoded = Object.values(lang.writingSystems ?? {})
    .map((ws) => ws.unicodeVersion)
    .filter(Boolean);
  return (otherEncoded.length / otherWritingSystems.length) * 10;
}

function computeWikipediaScore(lang: LanguageData): number {
  const { wikipedias } = lang;
  if (!wikipedias || wikipedias.length === 0) return 0;
  if (wikipedias.some((wiki) => wiki.status === WikipediaStatus.Active)) return 10;
  if (wikipedias.some((wiki) => wiki.status === WikipediaStatus.Incubator)) return 4; // incubator
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

export default getDigitalSupportFactorScore;
