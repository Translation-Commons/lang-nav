import React from 'react';

import { LanguageData } from '../../types/LanguageTypes';
import { CLDRCoverageText, ICUSupportStatus } from '../common/CLDRCoverageInfo';
import DetailsField from '../common/details/DetailsField';
import DetailsSection from '../common/details/DetailsSection';
import ObjectWikipediaInfo from '../common/ObjectWikipediaInfo';

import LanguageVitalityMeter from './LanguageVitalityMeter';

const LanguageDetailsVitalityAndViability: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const {
    vitalityISO,
    vitalityEth2013,
    vitalityEth2025,
    viabilityConfidence,
    viabilityExplanation,
  } = lang;

  return (
    <DetailsSection title="Vitality & Viability">
      {vitalityISO && <DetailsField title="ISO Vitality / Status:">{vitalityISO}</DetailsField>}
      {vitalityEth2013 && (
        <DetailsField title="Ethnologue Vitality (2013):">
            <span>{vitalityEth2013} </span>
            <LanguageVitalityMeter value={vitalityEth2013} />
        </DetailsField>
      )}
      {vitalityEth2025 && (
        <DetailsField title="Ethnologue Vitality (2025):">{vitalityEth2025}</DetailsField>
      )}
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
