import React from 'react';

import ResponsiveGrid from '@widgets/cardlists/ResponsiveGrid';
import DetailsField from '@widgets/details/ui/DetailsField';
import DetailsSection from '@widgets/details/ui/DetailsSection';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';

import CLDRWarningNotes from '@entities/ui/CLDRWarningNotes';
import ICUSupportStatus from '@entities/ui/ICUSupportStatus';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';
import CommaSeparated from '@shared/ui/CommaSeparated';
import Deemphasized from '@shared/ui/Deemphasized';
import LinkButton from '@shared/ui/LinkButton';

import { getDigitalSupportDimensionLabel } from '@strings/DigitalSupportStrings';

import { EntityCLDRCoverageLevel, EntityCLDRLocaleCount } from '../../ui/CLDRCoverageInfo';
import EntityWikipediaInfo from '../../ui/EntityWikipediaInfo';
import { LanguageData } from '../LanguageTypes';

import LanguageDigitalSupportMeter from './DigitalSupportMeter';
import { DigitalSupportDimension } from './DigitalSupportTypes';
import LanguageUDHRInfo, { LanguageUDHRDescription } from './LanguageUDHRInfo';

type Props = { lang: LanguageData };

const LanguageDetailsDigitalSupport: React.FC<Props> = ({ lang }) => {
  const { digitalSupportScore } = lang;
  if (!digitalSupportScore) return null; // Withhold the section
  return (
    <DetailsSection title="Digital Support">
      <ResponsiveGrid>
        {Object.values(DigitalSupportDimension).map((dimension) => (
          <div
            key={dimension}
            style={{
              gridColumn: dimension === DigitalSupportDimension.Overall ? '1 / -1' : 'span 1',
            }}
          >
            <strong>{getDigitalSupportDimensionLabel(dimension)}:</strong>{' '}
            {Math.floor(digitalSupportScore[dimension])}/10
            <LanguageDigitalSupportMeter lang={lang} dim={dimension} />
            <DigitalSupportDimensionBreakdown key={dimension} lang={lang} dimension={dimension} />
          </div>
        ))}
      </ResponsiveGrid>
    </DetailsSection>
  );
};

type DimProps = { lang: LanguageData; dimension: DigitalSupportDimension };

const DigitalSupportDimensionBreakdown: React.FC<DimProps> = ({ lang, dimension }) => {
  switch (dimension) {
    case DigitalSupportDimension.Overall:
      return <></>;
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
            <LanguageUDHRInfo lang={lang} size="long" />
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
            <ICUSupportStatus ent={lang} />
          </DetailsField>
        </>
      );
    case DigitalSupportDimension.MachineTranslation:
      return (
        <DetailsField title="Google Translate">
          {lang.googleTranslate?.length ? (
            lang.googleTranslate.length +
            ' language pack' +
            (lang.googleTranslate.length > 1 ? 's' : '')
          ) : (
            <Deemphasized>Not available</Deemphasized>
          )}
        </DetailsField>
      );
    case DigitalSupportDimension.Interfaces:
      return (
        <>
          <DetailsField title="Windows 11">
            {lang.win11LanguagePacks?.length ? (
              lang.win11LanguagePacks.length +
              ' language pack' +
              (lang.win11LanguagePacks.length > 1 ? 's' : '')
            ) : (
              <Deemphasized>Not available</Deemphasized>
            )}
          </DetailsField>
          <DetailsField title="MacOS">
            {lang.macos?.length ? (
              lang.macos.length + ' language pack' + (lang.macos.length > 1 ? 's' : '')
            ) : (
              <Deemphasized>Not available</Deemphasized>
            )}
          </DetailsField>
          <DetailsField title="iOS">
            {lang.ios?.length ? (
              lang.ios.length + ' language pack' + (lang.ios.length > 1 ? 's' : '')
            ) : (
              <Deemphasized>Not available</Deemphasized>
            )}
          </DetailsField>
        </>
      );
    default:
      enforceExhaustiveSwitch(dimension);
  }
};

export default LanguageDetailsDigitalSupport;
