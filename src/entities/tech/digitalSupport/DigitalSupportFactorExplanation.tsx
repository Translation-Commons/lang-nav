import React from 'react';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';

import { WikipediaStatus } from '@entities/language/digitalsupport/DigitalSupportTypes';
import type { LanguageData } from '@entities/language/LanguageTypes';
import { CLDRCoverageLevel } from '@entities/types/CLDRTypes';
import { EntityType } from '@entities/types/EntityTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';
import CommaSeparated from '@shared/ui/CommaSeparated';

import { BooksPublishedExplanation } from './DigitalSupportBooksPublished';
import { DigitalSupportFactor } from './DigitalSupportTypes';

const DigitalSupportFactorExplanation: React.FC<{
  ent: LanguageData;
  factor: DigitalSupportFactor;
}> = ({ ent, factor }) => {
  switch (factor) {
    // Communication
    case DigitalSupportFactor.UnicodeEncoding:
      return getUnicodeEncodingScore(ent);

    case DigitalSupportFactor.Keyman:
      return (
        <CommaSeparated>
          {ent.keyboards
            ?.filter((kb) => kb.inputTechCode === 'Keyman')
            .map((kb) => (
              <HoverableEntityName key={kb.ID} ent={kb} />
            ))}
        </CommaSeparated>
      );
    case DigitalSupportFactor.Gboard:
      return ent.keyboards?.filter((kb) => kb.inputTechCode === 'GBoard').length ? 10 : 0;

    case DigitalSupportFactor.Grammarly:
      return <TechSupport ent={ent} techShortName="Grammarly" />;
    case DigitalSupportFactor.QuillBot:
      return <TechSupport ent={ent} techShortName="Quillbot" />;
    case DigitalSupportFactor.LanguageTool:
      return <TechSupport ent={ent} techShortName="LanguageTool" />;

    // Content
    case DigitalSupportFactor.BooksPublishedAnnually:
      return <BooksPublishedExplanation ent={ent} />;
    case DigitalSupportFactor.Wikipedia:
      return computeWikipediaScore(ent);
    case DigitalSupportFactor.UDHR:
      return ent.udhr?.length ? 10 : 0;

    case DigitalSupportFactor.CLDR:
      return computeCLDRScore(ent);

    case DigitalSupportFactor.GTranslate:
      return <TechSupport ent={ent} techShortName="GTranslate" />;
    case DigitalSupportFactor.MSTranslator:
      return <TechSupport ent={ent} techShortName="MS Translator" />;

    // Interfaces
    case DigitalSupportFactor.Android:
      return <TechSupport ent={ent} techShortName="Android" />;
    case DigitalSupportFactor.iOS:
      return <TechSupport ent={ent} techShortName="iOS" />;
    case DigitalSupportFactor.macOS:
      return <TechSupport ent={ent} techShortName="macOS" />;
    case DigitalSupportFactor.Win11:
      return <TechSupport ent={ent} techShortName="win11" />;

    case DigitalSupportFactor.ClaudeSonnet:
      return <TechSupport ent={ent} techShortName="Claude" />;

    default:
      enforceExhaustiveSwitch(factor);
  }
};

// TODO make these tooltips explanations, not just show the score
function TechSupport({ ent, techShortName }: { ent: LanguageData; techShortName: string }) {
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

export default DigitalSupportFactorExplanation;
