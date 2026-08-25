import React from 'react';

import DetailsField from '@widgets/details/ui/DetailsField';
import DetailsSection from '@widgets/details/ui/DetailsSection';

import Deemphasized from '@shared/ui/Deemphasized';

import { LanguageData } from '../LanguageTypes';

import LanguageVitalityMeter from './VitalityMeter';
import { VitalitySource } from './VitalityTypes';

const LanguageDetailsVitalityAndViability: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { viabilityConfidence, viabilityExplanation } = lang;

  return (
    <DetailsSection title="Vitality & Viability">
      <DetailsField title="Vitality Metascore">
        <Deemphasized>Under construction</Deemphasized>
        {/* <LanguageVitalityMeter lang={lang} src={VitalitySource.Metascore} /> */}
      </DetailsField>
      <DetailsField title="ISO Status">
        <LanguageVitalityMeter lang={lang} src={VitalitySource.ISO} />
      </DetailsField>
      <DetailsField title="Good language category?">
        {viabilityConfidence} {viabilityExplanation && ' ... '}
        {viabilityExplanation}
      </DetailsField>
    </DetailsSection>
  );
};

export default LanguageDetailsVitalityAndViability;
