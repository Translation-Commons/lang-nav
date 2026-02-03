import React from 'react';

import Deemphasized from '@shared/ui/Deemphasized';
import LinkButton from '@shared/ui/LinkButton';

import { LanguageData } from '../LanguageTypes';

import {
  getLanguageISOStatusLabel,
  getVitalityEthnologueCoarseDescription,
  getVitalityEthnologueCoarseLabel,
  getVitalityEthnologueFineDescription,
  getVitalityEthnologueFineLabel,
} from './VitalityStrings';
import { VitalitySource } from './VitalityTypes';

const VitalityExplanation: React.FC<{ source: VitalitySource; lang: LanguageData }> = ({
  source,
  lang,
}) => {
  const { iso, ethFine, ethCoarse, meta } = lang.vitality ?? {};

  switch (source) {
    case VitalitySource.ISO:
      if (iso == null) return <Deemphasized>No ISO status available</Deemphasized>;
      return (
        <div>
          <div>ISO Status: {getLanguageISOStatusLabel(iso)}</div>
          <div>Normalized to a score of {iso} out of 9.</div>
          {lang.ISO.status == null && (
            <div>
              This ISO status is derived from languages contained by this one, not directly
              assigned.
            </div>
          )}
        </div>
      );

    case VitalitySource.Eth2012:
      if (ethFine == null) return <Deemphasized>No vitality data available</Deemphasized>;
      return (
        <div>
          <div>
            <strong>{getVitalityEthnologueFineLabel(ethFine)}</strong>{' '}
            {getVitalityEthnologueFineDescription(ethFine)}
          </div>
          <div>
            This value is based on the EGIDS (Extended Graded Intergenerational Disruption Scale).
            To make it comparable to other vitality scores, it has been normalized to a score of{' '}
            {ethFine} out of 9.
            <LinkButton href="https://www.ethnologue.com/methodology/#language-status">
              ethnologue methodology
            </LinkButton>
          </div>

          {lang.vitality?.ethnologue2012 == null ? (
            <div>
              The value is derived from languages contained by this one, not directly from
              Ethnologue.
            </div>
          ) : (
            <div>The value comes directly from Ethnologue, downloaded in 2012.</div>
          )}
        </div>
      );

    case VitalitySource.Eth2025:
      if (ethCoarse == null) return <Deemphasized>No vitality data available</Deemphasized>;
      return (
        <div>
          <div>
            <strong>{getVitalityEthnologueCoarseLabel(ethCoarse)}</strong>{' '}
            {getVitalityEthnologueCoarseDescription(ethCoarse)}
          </div>
          <div>
            This value is based on a simplified of the Graded Intergenerational Disruption Scale. To
            make it comparable to other vitality scores, it has been normalized to a score of{' '}
            {ethCoarse} out of 9.
          </div>
          {lang.vitality?.ethnologue2025 == null ? (
            <div>
              The value is derived from languages contained by this one, not directly from
              Ethnologue.
            </div>
          ) : (
            <div>The value comes directly from Ethnologue, downloaded in 2025.</div>
          )}
        </div>
      );

    case VitalitySource.Metascore: {
      if (meta == null) {
        return <Deemphasized>No vitality data available</Deemphasized>;
      }
      if (ethFine != null && ethCoarse != null) {
        return (
          <div>
            <div>
              Average of 2 Ethnologue vitality estimates to score: {meta.toFixed(1)}/9.
              <div style={{ marginLeft: '2em' }}>
                <strong>{getVitalityEthnologueFineLabel(ethFine)}</strong> ({ethFine}){' '}
                {getVitalityEthnologueFineDescription(ethFine)}
              </div>
              <div style={{ marginLeft: '2em' }}>
                <strong>{getVitalityEthnologueCoarseLabel(ethCoarse)}</strong> ({ethCoarse}){' '}
                {getVitalityEthnologueCoarseDescription(ethCoarse)}
              </div>
            </div>
            <div>
              In 2012 Ethnologue provided data on a 9-point EGIDS (Extended Graded Intergenerational
              Disruption Scale) scale, but by 2025 the publicly available data was limited to 4
              levels. Since the language coverage between years is also not consistent, we instead
              combined both estimates by converting them to a normalized score and averaged the data
              from 2012 and 2025.
              <LinkButton href="https://www.ethnologue.com/methodology/#language-status">
                methodology
              </LinkButton>
            </div>
            {lang.vitality?.ethnologue2012 == null && (
              <div>
                The value is derived wholly or partially from languages contained by this one, not
                directly from Ethnologue.
              </div>
            )}
          </div>
        );
      }
      if (ethFine != null) {
        return (
          <div>
            <div>There is no 2025 value from Ethnologue but there is a value from 2012:</div>
            <VitalityExplanation source={VitalitySource.Eth2012} lang={lang} />
          </div>
        );
      }
      if (ethCoarse != null) {
        return (
          <div>
            <div>There is no 2012 value from Ethnologue but there is a value from 2025:</div>
            <VitalityExplanation source={VitalitySource.Eth2025} lang={lang} />
          </div>
        );
      }
      if (iso != null) {
        return (
          <div>
            <div>
              There is no data from Ethnologue, so we&apos;re just using the status from ISO:
            </div>
            <VitalityExplanation source={VitalitySource.ISO} lang={lang} />
          </div>
        );
      }
    }
  }
  return (
    <Deemphasized>Vitality data not available from this source for this language</Deemphasized>
  );
};

export default VitalityExplanation;
