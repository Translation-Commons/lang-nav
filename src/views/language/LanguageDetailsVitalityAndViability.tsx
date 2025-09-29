import React from 'react';

import { LanguageData } from '../../types/LanguageTypes';
import { CLDRCoverageText, ICUSupportStatus } from '../common/CLDRCoverageInfo';
import DetailsField from '../common/details/DetailsField';
import DetailsSection from '../common/details/DetailsSection';
import ObjectWikipediaInfo from '../common/ObjectWikipediaInfo';

import { VitalityMeterType } from './LanguageVitalityComputation';
import LanguageVitalityMeter from './LanguageVitalityMeter';

const LanguageDetailsVitalityAndViability: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { viabilityConfidence, viabilityExplanation } = lang;

  return (
    <DetailsSection title="Vitality & Viability">
      <DetailsField title="Vitality Metascore:">
        <LanguageVitalityMeter lang={lang} type={VitalityMeterType.Metascore} />
      </DetailsField>

      <DetailsField title="ISO Vitality / Status:">
        <LanguageVitalityMeter lang={lang} type={VitalityMeterType.ISO} />
      </DetailsField>

      <DetailsField title="Ethnologue (2013):">
        <LanguageVitalityMeter lang={lang} type={VitalityMeterType.Eth2013} />
      </DetailsField>

      <DetailsField title="Ethnologue (2025):">
        <LanguageVitalityMeter lang={lang} type={VitalityMeterType.Eth2025} />
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
