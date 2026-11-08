import React from 'react';

import DetailsField from '@widgets/details/ui/DetailsField';

import { useDataContext } from '@features/data/context/useDataContext';
import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';

import { TechScope } from '@entities/tech/TechnologyTypes';
import CLDRWarningNotes from '@entities/ui/CLDRWarningNotes';
import ICUSupportStatus from '@entities/ui/ICUSupportStatus';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';
import CommaSeparated from '@shared/ui/CommaSeparated';
import Deemphasized from '@shared/ui/Deemphasized';
import LinkButton from '@shared/ui/LinkButton';

import { EntityCLDRCoverageLevel, EntityCLDRLocaleCount } from '../../ui/CLDRCoverageInfo';
import EntityWikipediaInfo from '../../ui/EntityWikipediaInfo';
import type { LanguageData } from '../LanguageTypes';

import { getTechsForLanguage } from './computeLanguageDigitalSupportStatus';
import {
  DigitalSupportCategory,
  DigitalSupportDimension,
  getTechScopeForSupportDim,
} from './DigitalSupportTypes';
import LanguageUDHRInfo, { LanguageUDHRDescription } from './LanguageUDHRInfo';

type Props = { lang: LanguageData; dimension: DigitalSupportCategory };

/**
 * The supporting evidence behind a single digital support category. Shared between the main
 * Language Details view and the drawer so the two can never describe a category differently.
 */
const DigitalSupportDimensionBreakdown: React.FC<Props> = ({ lang, dimension }) => {
  const { getTechnology } = useDataContext();
  const TechName = ({ shortName }: { shortName: string }) => {
    const tech = getTechnology(shortName);
    if (!tech) return shortName;
    return <HoverableEntityName ent={getTechnology(shortName)} />;
  };

  switch (dimension) {
    case DigitalSupportDimension.Keyboards:
      return lang.keyboards?.length ? (
        <CommaSeparated>
          {lang.keyboards.map((keyboard) => (
            <HoverableEntityName key={keyboard.ID} ent={keyboard} />
          ))}
        </CommaSeparated>
      ) : (
        'No known keyboards are available on Keyman or GBoard'
      );
    case DigitalSupportDimension.Documentation:
      return (
        <>
          <DetailsField
            title="Wikipedia"
            endContent={
              lang.wikipedias &&
              lang.wikipedias.length > 0 && (
                <LinkButton href={lang.wikipedias[0].url}>{lang.wikipedias[0].url}</LinkButton>
              )
            }
          >
            <EntityWikipediaInfo ent={lang} />
          </DetailsField>
          <DetailsField title="UDHR" description={LanguageUDHRDescription}>
            <div className="inline-block">
              <LanguageUDHRInfo lang={lang} size="long" />
            </div>
          </DetailsField>
        </>
      );
    case DigitalSupportDimension.I18nFrameworks:
      return (
        <>
          <DetailsField title="CLDR Coverage">
            <div style={{ display: 'inline-flex', flexDirection: 'row', gap: '0.5em' }}>
              <CLDRWarningNotes ent={lang} />
              <EntityCLDRCoverageLevel ent={lang} />
              <EntityCLDRLocaleCount ent={lang} verbose={true} />
            </div>
          </DetailsField>
          <DetailsField title="ICU Support">
            <div className="inline-block align-middle">
              <ICUSupportStatus ent={lang} />
            </div>
          </DetailsField>
        </>
      );
    case DigitalSupportDimension.MachineTranslation:
    case DigitalSupportDimension.AI:
      return getTechsForLanguage(lang, getTechScopeForSupportDim(dimension)).map(
        ({ techShortName, entries }) => (
          <DetailsField key={techShortName} title={<TechName shortName={techShortName} />}>
            {entries.length > 0 ? 'Available' : <Deemphasized>Not available</Deemphasized>}
          </DetailsField>
        ),
      );
    case DigitalSupportDimension.Interfaces:
      return getTechsForLanguage(lang, TechScope.OperatingSystem).map(
        ({ techShortName, entries }) => (
          <DetailsField key={techShortName} title={<TechName shortName={techShortName} />}>
            {entries.length > 0 ? (
              `${entries.length} language pack${entries.length > 1 ? 's' : ''}`
            ) : (
              <Deemphasized>Not available</Deemphasized>
            )}
          </DetailsField>
        ),
      );
    default:
      enforceExhaustiveSwitch(dimension);
  }
};

export default DigitalSupportDimensionBreakdown;
