import React from 'react';

import Deemphasized from '@shared/ui/Deemphasized';

import type { LanguageData } from '../LanguageTypes';

import { getEndangermentLabel, getLanguageISOStatusLabel } from './VitalityStrings';
import { VitalitySource } from './VitalityTypes';

const VitalityExplanation: React.FC<{ source: VitalitySource; lang: LanguageData }> = ({
  source,
  lang,
}) => {
  const { iso, meta, unesco } = lang.vitality ?? {};

  switch (source) {
    case VitalitySource.UNESCO:
      if (unesco == null) return <Deemphasized>No UNESCO assessment</Deemphasized>;
      return (
        <div>
          <div>UNESCO Endangerment: {getEndangermentLabel(unesco)}</div>
          <div>Normalized to a score of {unesco} out of 9.</div>
          {lang.Glottolog.endangerment == null && (
            <div>
              The endangerment is derived from languages contained by this one, not directly
              assigned.
            </div>
          )}
        </div>
      );

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

    case VitalitySource.Metascore: {
      if (meta == null) return <Deemphasized>No vitality data available</Deemphasized>;
      if (iso != null && unesco != null)
        return (
          <div>
            This is a score that averages the ISO Status and the Glottolog Endangerment level.
            <div>ISO Status: {getLanguageISOStatusLabel(iso)}</div>
            <div>UNESCO Endangerment: {getEndangermentLabel(unesco)}</div>
            <div>Normalized to a score of {meta} out of 9.</div>
          </div>
        );

      if (unesco != null) return <VitalityExplanation source={VitalitySource.ISO} lang={lang} />;
      if (iso != null) return <VitalityExplanation source={VitalitySource.ISO} lang={lang} />;
    }
  }
  return (
    <Deemphasized>Vitality data not available from this source for this language</Deemphasized>
  );
};

export default VitalityExplanation;
