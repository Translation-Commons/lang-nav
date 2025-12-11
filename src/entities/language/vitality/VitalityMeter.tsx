import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';

import { LanguageData } from '@entities/language/LanguageTypes';

import Deemphasized from '@shared/ui/Deemphasized';

import { getVitalityScore } from './LanguageVitalityComputation';
import VitalityExplanation from './VitalityExplanation';
import { VitalitySource } from './VitalityTypes';

interface Props {
  lang: LanguageData;
  src: VitalitySource;
}

const LanguageVitalityMeter: React.FC<Props> = ({ lang, src }) => {
  const score = getVitalityScore(src, lang);

  if (score === null) {
    return <Deemphasized>Data not available</Deemphasized>;
  }

  return (
    <Hoverable hoverContent={<VitalityExplanation source={src} lang={lang} />}>
      <meter
        min={0} // Extinct
        low={3} // Shifting/Endangered -- below this, the meter is colored red
        high={7} // Trade/Stable -- below this, the meter is colored yellow
        optimum={8} // Regional -- tells the renderer that high and above is green
        max={9} // National/Institutional/Living
        value={score}
        style={{ width: '100%', minWidth: '8em' }}
      />
    </Hoverable>
  );
};

export default LanguageVitalityMeter;
