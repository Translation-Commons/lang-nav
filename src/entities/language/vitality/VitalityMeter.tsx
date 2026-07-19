import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';

import { LanguageData } from '@entities/language/LanguageTypes';

import Deemphasized from '@shared/ui/old/Deemphasized';

import { getVitalityScore } from './LanguageVitalityComputation';
import VitalityExplanation from './VitalityExplanation';
import { VitalitySource } from './VitalityTypes';

interface Props {
  lang: LanguageData;
  src: VitalitySource;
}

const LanguageVitalityMeter: React.FC<Props> = ({ lang, src }) => {
  const score = getVitalityScore(src, lang);

  if (score == null) {
    return <Deemphasized>Data not available</Deemphasized>;
  }

  const fillColor = score < 3 ? 'bg-red-500' : score < 7 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <Hoverable hoverContent={<VitalityExplanation source={src} lang={lang} />}>
      <div
        role="meter"
        aria-label="Language vitality"
        aria-valuemin={0}
        aria-valuemax={9}
        aria-valuenow={score}
        className="h-2 w-full min-w-32 rounded-full bg-muted"
      >
        <div
          className={`h-full rounded-full ${fillColor}`}
          style={{ width: `${(score / 9) * 100}%` }}
        />
      </div>
    </Hoverable>
  );
};

export default LanguageVitalityMeter;
