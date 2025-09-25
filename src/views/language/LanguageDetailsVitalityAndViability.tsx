import React from 'react';

import Hoverable from '../../generic/Hoverable';
import { LanguageData } from '../../types/LanguageTypes';
import { CLDRCoverageText, ICUSupportStatus } from '../common/CLDRCoverageInfo';
import DetailsField from '../common/details/DetailsField';
import DetailsSection from '../common/details/DetailsSection';
import ObjectWikipediaInfo from '../common/ObjectWikipediaInfo';

import { getAllVitalityScores } from './LanguageVitalityComputation';
import LanguageVitalityMeter from './LanguageVitalityMeter';

// Component for individual vitality meters with hover explanations
const VitalityMeter: React.FC<{
  score: number | null;
  value: string | null;
  title: string;
  explanation: string;
}> = ({ score, value, title, explanation }) => {
  if (score === null || value === null) {
    return null;
  }

  return (
    <DetailsField title={title}>
      <span>{value} </span>
      <Hoverable hoverContent={`${title}: ${score} (${explanation})`}>
        <meter
          min={0}
          low={3}
          high={7}
          optimum={8}
          max={9}
          value={score}
          title={`${title}: ${score}`}
          style={{ width: '100%', minWidth: '8em' }}
        />
      </Hoverable>
    </DetailsField>
  );
};

const LanguageDetailsVitalityAndViability: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { viabilityConfidence, viabilityExplanation } = lang;

  const vitalityScores = getAllVitalityScores(lang);

  return (
    <DetailsSection title="Vitality & Viability">
      <DetailsField title="Vitality Metascore:">
        <LanguageVitalityMeter lang={lang} />
      </DetailsField>

      <VitalityMeter
        score={vitalityScores.iso.score}
        value={vitalityScores.iso.value}
        title="ISO Vitality / Status:"
        explanation={`ISO scale: Living=9, Constructed=3, Historical=1, Extinct=0`}
      />

      <VitalityMeter
        score={vitalityScores.eth2013.score}
        value={vitalityScores.eth2013.value}
        title="Ethnologue (2013):"
        explanation={`Ethnologue 2013 scale: National=9, Regional=8, Trade=7, Educational=6, Written=5, Threatened=4, Shifting=3, Moribund=2, Nearly Extinct=1, Extinct=0`}
      />

      <VitalityMeter
        score={vitalityScores.eth2025.score}
        value={vitalityScores.eth2025.value}
        title="Ethnologue (2025):"
        explanation={`Ethnologue 2025 scale: Institutional=9, Stable=6, Endangered=3, Extinct=0`}
      />
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
