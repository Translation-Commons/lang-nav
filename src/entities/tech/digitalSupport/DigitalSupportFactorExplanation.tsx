import React from 'react';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import InternalLinkButton from '@features/params/InternalLinkButton';
import { View } from '@features/params/PageParamTypes';
import { getFilterEntityID } from '@features/transforms/filtering/FilterEntityID';

import type { LanguageData } from '@entities/language/LanguageTypes';
import { CLDRCoverageLevel } from '@entities/types/CLDRTypes';
import { EntityType } from '@entities/types/EntityTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';
import Deemphasized from '@shared/ui/Deemphasized';
import ExternalLink from '@shared/ui/ExternalLink';

import { BooksPublishedExplanation } from './DigitalSupportBooksPublished';
import { DigitalSupportFactor } from './DigitalSupportTypes';
import { UnicodeEncodingExplanation } from './DigitalSupportUnicodeEncoding';
import { DigitalSupportWikipediaExplanation } from './DigitalSupportWikipedia';

const DigitalSupportFactorExplanation: React.FC<{
  ent: LanguageData;
  factor: DigitalSupportFactor;
}> = ({ ent, factor }) => {
  switch (factor) {
    // Communication
    case DigitalSupportFactor.UnicodeEncoding:
      return <UnicodeEncodingExplanation ent={ent} />;

    case DigitalSupportFactor.Keyman:
      return <KeyboardSupport ent={ent} inputTechCode="Keyman" />;
    case DigitalSupportFactor.Gboard:
      return <KeyboardSupport ent={ent} inputTechCode="GBoard" />;

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
      return <DigitalSupportWikipediaExplanation ent={ent} />;
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

function KeyboardSupport({ ent, inputTechCode }: { ent: LanguageData; inputTechCode: string }) {
  const keyboards = ent.keyboards?.filter((kb) => kb.inputTechCode === inputTechCode);
  if (!keyboards?.length) return <Deemphasized>Not supported by {inputTechCode}</Deemphasized>;

  return (
    <>
      <div>
        {keyboards.length.toLocaleString()} {inputTechCode} keyboards
      </div>
      <ul>
        {keyboards.slice(0, 10).map((kb) => (
          <li key={kb.ID}>
            <HoverableEntityName ent={kb} />
          </li>
        ))}
        {keyboards.length > 10 && <li>and {(keyboards.length - 10).toLocaleString()} more...</li>}
      </ul>
      <InternalLinkButton
        newWindow
        params={{
          entType: EntityType.Keyboard,
          view: View.Table,
          languageFilter: getFilterEntityID(ent),
        }}
      >
        See all in table view
      </InternalLinkButton>
    </>
  );
}

function TechSupport({ ent, techShortName }: { ent: LanguageData; techShortName: string }) {
  const techSupports = ent.techSupport?.filter((ts) => ts.techShortName === techShortName);
  if (!techSupports?.length) return <Deemphasized>Not supported by {techShortName}</Deemphasized>;
  const url = techSupports[0].tech.languageSupportURL;

  return (
    <>
      <ul>
        {techSupports?.map((ts) => (
          <li key={ts.techShortName}>
            <HoverableEntityName ent={ts.tech} /> for {ts.name}
            {ts.level != null && ` at level ${ts.level}`}
            {ts.tech.maxLevel != null && ` out of ${ts.tech.maxLevel}`}
          </li>
        ))}
      </ul>
      {url && <ExternalLink href={url} showDomainOnly />}
    </>
  );
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
