import React from 'react';

import { LanguageData } from '@entities/language/LanguageTypes';

import DetailsSection from '@shared/containers/DetailsSection';
import ArcGauge from '@shared/ui/ArcGauge';

import { getVitalityScore } from './LanguageVitalityComputation';
import { getVitalityLabel } from './VitalityStrings';
import { VitalitySource } from './VitalityTypes';

const LanguageVitalitySection: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const eth2025Score = getVitalityScore(VitalitySource.Eth2025, lang);
  const isoScore = getVitalityScore(VitalitySource.ISO, lang);

  return (
    <DetailsSection title="Vitality">
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2em',
          marginTop: 'auto',
          paddingBottom: '0.5em',
        }}
      >
        <ArcGauge
          value={eth2025Score}
          max={9}
          label={getVitalityLabel(lang, VitalitySource.Eth2025) ?? '—'}
          sublabel="Ethnologue"
        />
        <ArcGauge
          value={isoScore}
          max={9}
          label={getVitalityLabel(lang, VitalitySource.ISO) ?? '—'}
          sublabel="ISO"
        />
      </div>
    </DetailsSection>
  );
};

export default LanguageVitalitySection;
