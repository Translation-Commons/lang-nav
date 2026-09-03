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

      <DrawerDetailsSection title="Technical Details">
        <DrawerDetailsField
          label="ISO Status"
          hasData={!!ISO.status || ISO.scope === LanguageScope.Family}
        >
          {ISO.status ? (
            ISO.status ? (
              getLanguageISOStatusLabel(ISO.status)
            ) : (
              getLanguageScopeLabel(ISO.scope)
            )
          ) : (
            <Deemphasized>Not in ISO</Deemphasized>
          )}
          {ISO.scope && ISO.scope !== lang.scope && <Badge>{ISO.scope}</Badge>}
        </DrawerDetailsField>
        {ISO.code && (
          <DrawerDetailsField
            label="ISO code"
            actions={
              <ExternalLink href={`https://iso639-3.sil.org/code/${ISO.code}`}>
                ISO catalog
              </ExternalLink>
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
                glottolog.org
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

        <DrawerDetailsField
          label="Digital support"
          hasData={!!lang.digitalSupportScore}
          expandedContent={
            <table>
              <tbody>
                {Object.values(DigitalSupportDimension)
                  .filter(
                    (dimension) =>
                      digitalSupport?.[dimension] != null &&
                      dimension !== DigitalSupportDimension.Overall,
                  )
                  .map((dimension) => (
                    <tr key={dimension}>
                      <td>{getDigitalSupportDimensionLabel(dimension)}</td>
                      <td>{numberToSigFigs(digitalSupport?.[dimension] ?? 0, 2)}/10</td>
                      <td>
                        <LanguageDigitalSupportMeter lang={lang} dim={dimension} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          }
        >
          <div className="flex flex-row gap-1 items-center">
            {digitalSupport?.[DigitalSupportDimension.Overall] != null &&
              `${numberToSigFigs(digitalSupport?.[DigitalSupportDimension.Overall], 2)}/10`}
            <LanguageDigitalSupportMeter lang={lang} dim={DigitalSupportDimension.Overall} />
          </div>
        </DrawerDetailsField>
      </DrawerDetailsSection>
    </div>
  );
};

export default LanguageDrawerContents;
