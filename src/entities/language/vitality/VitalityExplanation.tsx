import React from 'react';

import Deemphasized from '@shared/ui/Deemphasized';
import LinkButton from '@shared/ui/LinkButton';

import { LanguageData } from '../LanguageTypes';

import {
  getLanguageISOStatusLabel,
  getVitalityEthnologueCoarseLabel,
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

    case VitalitySource.Eth2013:
      if (ethFine == null) return <Deemphasized>No vitality data available</Deemphasized>;
      return (
        <div>
          <div>
            Ethnologue 2013 Vitality: {getVitalityEthnologueFineLabel(ethFine)}
            <LinkButton href="https://www.ethnologue.com/methodology/#language-status">
              methodology
            </LinkButton>
          </div>
          <div>Normalized to a score of {ethFine} out of 9.</div>

          {lang.vitality?.ethnologue2013 == null && (
            <div>
              The value is derived from languages contained by this one, not directly from
              Ethnologue.
            </div>
          )}
        </div>
      );

    case VitalitySource.Eth2025:
      if (ethCoarse == null) return <Deemphasized>No vitality data available</Deemphasized>;
      return (
        <div>
          <div>Ethnologue 2025 Vitality: {getVitalityEthnologueCoarseLabel(ethCoarse)}</div>
          <div>Normalized to a score of {ethCoarse} out of 9.</div>
          {lang.vitality?.ethnologue2025 == null && (
            <div>
              The value is derived from languages contained by this one, not directly from
              Ethnologue.
            </div>
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
              Ethnologue changed the methodology of its vitality scores. So we convert them to a
              normalized score and averaged the data from 2013 and 2025. Average: {meta.toFixed(1)}.
            </div>
            <div style={{ marginLeft: '2em' }}>
              2013: {getVitalityEthnologueFineLabel(ethFine)} ({ethFine}){' '}
              <LinkButton href="https://www.ethnologue.com/methodology/#language-status">
                methodology
              </LinkButton>
            </div>
            <div style={{ marginLeft: '2em' }}>
              2025: {getVitalityEthnologueCoarseLabel(ethCoarse)} ({ethCoarse})
            </div>
            {lang.vitality?.ethnologue2013 == null && (
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
            <div>There is no 2025 value from Ethnologue but there is a value from 2013:</div>
            <VitalityExplanation source={VitalitySource.Eth2013} lang={lang} />
          </div>
        );
      }
      if (ethCoarse != null) {
        return (
          <div>
            <div>There is no 2013 value from Ethnologue but there is a value from 2025:</div>
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
