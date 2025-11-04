import React from 'react';

import DetailsField from '@shared/containers/DetailsField';
import DetailsSection from '@shared/containers/DetailsSection';

import { CLDRCoverageText, ICUSupportStatus } from '../../ui/CLDRCoverageInfo';
import ObjectWikipediaInfo from '../../ui/ObjectWikipediaInfo';
import { LanguageData } from '../LanguageTypes';

import LanguageVitalityMeter from './VitalityMeter';
import { VitalitySource } from './VitalityTypes';

const LanguageDetailsVitalityAndViability: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { viabilityConfidence, viabilityExplanation } = lang;

  return (
    <DetailsSection title="Vitality & Viability">
      <DetailsField title="Vitality Metascore:">
        <LanguageVitalityMeter lang={lang} type={VitalitySource.Metascore} />
      </DetailsField>

      <DetailsField title="ISO Vitality / Status:">
        <LanguageVitalityMeter lang={lang} type={VitalitySource.ISO} />
      </DetailsField>

      <DetailsField title="Ethnologue (2013):">
        <LanguageVitalityMeter lang={lang} type={VitalitySource.Eth2013} />
      </DetailsField>

      <DetailsField title="Ethnologue (2025):">
        <LanguageVitalityMeter lang={lang} type={VitalitySource.Eth2025} />
      </DetailsField>
      <DetailsField title="Should use in World Atlas:">
        {viabilityConfidence} ... {viabilityExplanation}
      </DetailsField>
      <DetailsField title="CLDR Coverage:">
        <CLDRCoverageText object={lang} />
      </DetailsField>
      <DetailsField title="ICU Support:">
        <ICUSupportStatus object={lang} />
      </DetailsField>
      <DetailsField title="Wikipedia:">
        <ObjectWikipediaInfo object={lang} />
      </DetailsField>
    </DetailsSection>
  );
};

export default LanguageDetailsVitalityAndViability;
