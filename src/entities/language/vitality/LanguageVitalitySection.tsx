import React from 'react';

import { LanguageData } from '@entities/language/LanguageTypes';

import DetailsSection from '@shared/containers/DetailsSection';
import ArcGauge from '@shared/ui/ArcGauge';

import { getVitalityScore } from './LanguageVitalityComputation';
import { getVitalityLabel } from './VitalityStrings';
import { VitalitySource } from './VitalityTypes';

const LanguageVitalitySection: React.FC<{ lang: LanguageData }> = ({ lang }) => {
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
        <ArcGauge value={null} max={9} label={'Digital Support'} sublabel="Coming Soon" />
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
