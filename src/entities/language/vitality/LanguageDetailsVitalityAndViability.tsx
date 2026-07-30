import React from 'react';

import DetailsField from '@shared/containers/DetailsField';
import DetailsSection from '@shared/containers/DetailsSection';
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
      {/* <DetailsField title="Ethnologue (2012)">
        <LanguageVitalityMeter lang={lang} src={VitalitySource.Eth2012} />{' '}
        {vitality.ethFine != null &&
          (Ethnologue.vitality2012 != null ? <Pill>Ethnologue 2012</Pill> : <Pill>Derived</Pill>)}
      </DetailsField>
      <DetailsField title="Ethnologue (2025)">
        <LanguageVitalityMeter lang={lang} src={VitalitySource.Eth2025} />{' '}
        {vitality.ethCoarse != null &&
          (Ethnologue.vitality2025 != null ? <Pill>Ethnologue 2025</Pill> : <Pill>Derived</Pill>)}
      </DetailsField> */}
      <DetailsField title="Good language category?">
        {viabilityConfidence} {viabilityExplanation && ' ... '}
        {viabilityExplanation}
      </DetailsField>
    </DetailsSection>
  );
};

export default LanguageDetailsVitalityAndViability;
