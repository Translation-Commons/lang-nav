import React from 'react';

import DetailsSection from '@widgets/details/ui/DetailsSection';

import { LanguageData } from '@entities/language/LanguageTypes';

import { numberToSigFigs } from '@shared/lib/numberUtils';
import ArcGauge from '@shared/ui/ArcGauge';

import { getVitalityScore } from './LanguageVitalityComputation';
import { getVitalityLabel } from './VitalityStrings';
import { VitalitySource } from './VitalityTypes';

const LanguageDetailsVitality: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const isoScore = getVitalityScore(VitalitySource.ISO, lang);
  const digitalScore = lang.digitalSupportScore?.overall;

  return (
    <DetailsSection title="Vitality" isCollapsible={false}>
      <div className="flex justify-center gap-8 mt-auto">
        <ArcGauge
          value={digitalScore ? numberToSigFigs(digitalScore, 2) : undefined}
          max={10}
          label="Digital Support"
          sublabel="Overall"
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

export default LanguageDetailsVitality;
