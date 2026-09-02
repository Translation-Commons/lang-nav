import React from 'react';

import { DrawerDetailsField, DrawerDetailsSection } from '@widgets/details/ui/DrawerDetailsSection';

import { LanguageData, LanguageField, LanguageScope } from '@entities/language/LanguageTypes';
import { EntityCLDRCoverageLevel } from '@entities/ui/CLDRCoverageInfo';
import CLDRWarningNotes from '@entities/ui/CLDRWarningNotes';

import { numberToSigFigs } from '@shared/lib/numberUtils';
import { Badge } from '@shared/ui/badge';
import ContextIcon from '@shared/ui/ContextIcon';
import Deemphasized from '@shared/ui/Deemphasized';
import ExternalLink from '@shared/ui/ExternalLink';

import { getDigitalSupportDimensionLabel } from '@strings/DigitalSupportStrings';
import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';

import LanguageDigitalSupportMeter from './digitalsupport/DigitalSupportMeter';
import { DigitalSupportDimension } from './digitalsupport/DigitalSupportTypes';
import LanguageDrawerSummary from './LanguageDrawerSummary';
import LanguageRetirementReason from './LanguageRetirementReason';
import { getLanguageISOStatusLabel } from './vitality/VitalityStrings';

type Props = {
  lang: LanguageData;
};

const LanguageDrawerContents: React.FC<Props> = ({ lang }) => {
  const { ISO } = lang;
  const digitalSupport = lang.digitalSupportScore;

  return (
    <div className="flex flex-col gap-3">
      <LanguageDrawerSummary lang={lang} />

      <DrawerDetailsSection title="Systems">
        <DrawerDetailsField label="ISO status">
          {ISO.status || ISO.scope === LanguageScope.Family ? (
            ISO.status ? (
              getLanguageISOStatusLabel(ISO.status)
            ) : (
              getLanguageScopeLabel(ISO.scope)
            )
          ) : (
            <Deemphasized>not in ISO</Deemphasized>
          )}
          {ISO.scope && ISO.scope !== lang.scope && <Badge>{ISO.scope}</Badge>}
        </DrawerDetailsField>
        {ISO.code && (
          <DrawerDetailsField
            label="ISO code"
            actions={
              <ExternalLink href={`https://iso639-3.sil.org/code/${ISO.code}`}> </ExternalLink>
            }
          >
            {ISO.code}
            {ISO.code6391 && ` | ${ISO.code6391}`}
            {lang.warnings[LanguageField.isoCode] && (
              <ContextIcon severity="warning">
                <LanguageRetirementReason lang={lang} />
              </ContextIcon>
            )}
          </DrawerDetailsField>
        )}
        {lang.Glottolog.code && (
          <DrawerDetailsField
            label="Glottocode"
            actions={
              <ExternalLink
                href={`https://glottolog.org/resource/languoid/id/${lang.Glottolog.code}`}
              >
                {' '}
              </ExternalLink>
            }
          >
            {lang.Glottolog.code}
          </DrawerDetailsField>
        )}
        {lang.CLDR.code && (
          <DrawerDetailsField label="CLDR">
            {lang.CLDR.code != ISO.code && lang.CLDR.code}
            <CLDRWarningNotes ent={lang} /> <EntityCLDRCoverageLevel ent={lang} />
          </DrawerDetailsField>
        )}
      </DrawerDetailsSection>

      {lang.digitalSupportScore && (
        <DrawerDetailsSection title="Digital support">
          {Object.values(DigitalSupportDimension).map((dimension) => (
            <DrawerDetailsField key={dimension} label={getDigitalSupportDimensionLabel(dimension)}>
              <div className="flex flex-row gap-1 items-center">
                {digitalSupport?.[dimension] == null ? (
                  <Deemphasized>No data</Deemphasized>
                ) : (
                  `${numberToSigFigs(digitalSupport?.[dimension], 2)}/10`
                )}
                <LanguageDigitalSupportMeter lang={lang} dim={dimension} />
              </div>
            </DrawerDetailsField>
          ))}
        </DrawerDetailsSection>
      )}
    </div>
  );
};

export default LanguageDrawerContents;
