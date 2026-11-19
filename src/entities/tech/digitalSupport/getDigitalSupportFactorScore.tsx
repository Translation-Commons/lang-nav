import { WikipediaStatus } from '@entities/language/digitalsupport/DigitalSupportTypes';
import type { LanguageData } from '@entities/language/LanguageTypes';
import { CLDRCoverageLevel } from '@entities/types/CLDRTypes';
import { EntityType } from '@entities/types/EntityTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

import { DigitalSupportFactor } from './DigitalSupportTypes';

// Returns a numeric score from 1 to 10
function getDigitalSupportFactorScore(ent: LanguageData, factor: DigitalSupportFactor): number {
  switch (factor) {
    // Communication
    case DigitalSupportFactor.Keyman:
      return ent.keyboards?.filter((kb) => kb.inputTechCode === 'Keyman').length ? 10 : 0;
    case DigitalSupportFactor.Gboard:
      return ent.keyboards?.filter((kb) => kb.inputTechCode === 'GBoard').length ? 10 : 0;

    case DigitalSupportFactor.Grammarly:
      return ent.techSupport?.filter((ts) => ts.techShortName === 'Grammarly').length ? 10 : 0;
    case DigitalSupportFactor.QuillBot:
      return ent.techSupport?.filter((ts) => ts.techShortName === 'Quillbot').length ? 10 : 0;
    case DigitalSupportFactor.LanguageTool:
      return ent.techSupport?.filter((ts) => ts.techShortName === 'LanguageTool').length ? 10 : 0;

    // Content
    case DigitalSupportFactor.Wikipedia:
      return computeWikipediaScore(ent);
    case DigitalSupportFactor.UDHR:
      return ent.udhr?.length ? 10 : 0;

    case DigitalSupportFactor.CLDR:
      return computeCLDRScore(ent);

    case DigitalSupportFactor.GTranslate:
      return ent.techSupport?.filter((ts) => ts.techShortName === 'GTranslate').length ? 10 : 0;
    case DigitalSupportFactor.MSTranslator:
      return ent.techSupport?.filter((ts) => ts.techShortName === 'MS Translator').length ? 10 : 0;

    // Interfaces
    case DigitalSupportFactor.Android:
      return ent.techSupport?.filter((ts) => ts.techShortName === 'Android').length ? 10 : 0;
    case DigitalSupportFactor.iOS:
      return ent.techSupport?.filter((ts) => ts.techShortName === 'iOS').length ? 10 : 0;
    case DigitalSupportFactor.macOS:
      return ent.techSupport?.filter((ts) => ts.techShortName === 'macOS').length ? 10 : 0;
    case DigitalSupportFactor.Win11:
      return ent.techSupport?.filter((ts) => ts.techShortName === 'win11').length ? 10 : 0;

    case DigitalSupportFactor.ClaudeSonnet:
      return ent.techSupport?.filter((ts) => ts.techShortName === 'Claude').length ? 10 : 0;

    default:
      enforceExhaustiveSwitch(factor);
  }
}

// 0-5
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
