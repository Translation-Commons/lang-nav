import React from 'react';

import ResponsiveGrid from '@widgets/cardlists/ResponsiveGrid';
import DetailsField from '@widgets/details/ui/DetailsField';
import DetailsSection from '@widgets/details/ui/DetailsSection';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';

import CLDRWarningNotes from '@entities/ui/CLDRWarningNotes';
import ICUSupportStatus from '@entities/ui/ICUSupportStatus';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';
import CommaSeparated from '@shared/ui/CommaSeparated';
import Deemphasized from '@shared/ui/Deemphasized';
import LinkButton from '@shared/ui/LinkButton';
import ScoreRing from '@shared/ui/ScoreRing';

import { getDigitalSupportDimensionLabel } from '@strings/DigitalSupportStrings';

import { ObjectCLDRCoverageLevel, ObjectCLDRLocaleCount } from '../../ui/CLDRCoverageInfo';
import ObjectWikipediaInfo from '../../ui/ObjectWikipediaInfo';
import { LanguageData } from '../LanguageTypes';

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
              display: 'flex',
              // The Overall row has no breakdown, so its title reads better beside the ring
              alignItems: dimension === DigitalSupportDimension.Overall ? 'center' : 'flex-start',
              gap: '0.6em',
            }}
          >
            <ScoreRing
              value={Math.floor(digitalSupportScore[dimension])}
              max={10}
              label={`${getDigitalSupportDimensionLabel(dimension)} score`}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600 }}>{getDigitalSupportDimensionLabel(dimension)}</div>
              <DigitalSupportDimensionBreakdown lang={lang} dimension={dimension} />
            </div>
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
            <HoverableObjectName key={keyboard.ID} object={keyboard} />
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
            <ObjectWikipediaInfo object={lang} />
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
              <CLDRWarningNotes object={lang} />
              <ObjectCLDRCoverageLevel object={lang} />
              <ObjectCLDRLocaleCount object={lang} verbose={true} />
            </div>
          </DetailsField>
          <DetailsField title="ICU Support">
            <ICUSupportStatus object={lang} />
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
