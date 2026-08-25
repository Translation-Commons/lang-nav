import React from 'react';

import Deemphasized from '@shared/ui/Deemphasized';

import { LanguageData } from '../LanguageTypes';

import { getLanguageISOStatusLabel } from './VitalityStrings';
import { VitalitySource } from './VitalityTypes';

const VitalityExplanation: React.FC<{ source: VitalitySource; lang: LanguageData }> = ({
  source,
  lang,
}) => {
  const { iso, meta } = lang.vitality ?? {};

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

    case VitalitySource.Metascore: {
      if (meta == null) {
        return <Deemphasized>No vitality data available</Deemphasized>;
      }
      // alternative vitality measures could go here
      if (iso != null) {
        return (
          <div>
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
