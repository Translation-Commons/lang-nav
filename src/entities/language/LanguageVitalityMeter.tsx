import { LanguageData } from '@entities/language/LanguageTypes';
import Deemphasized from '@shared/ui/Deemphasized';
import Hoverable from '@shared/ui/Hoverable';
import React from 'react';

import { VitalityMeterType, getAllVitalityScores } from './LanguageVitalityComputation';

interface Props {
  lang: LanguageData;
  type: VitalityMeterType;
}

const LanguageVitalityMeter: React.FC<Props> = ({ lang, type }) => {
  const scores = getAllVitalityScores(lang);
  const { score: value, explanation: hoverText } = scores[type];

  if (value === null) {
    return <Deemphasized>Data not available</Deemphasized>;
  }

  return (
    <Hoverable hoverContent={hoverText}>
      <meter
        min={0} // Extinct
        low={3} // Shifting/Endangered -- below this, the meter is colored red
        high={7} // Trade/Stable -- below this, the meter is colored yellow
        optimum={8} // Regional -- tells the renderer that high and above is green
        max={9} // National/Institutional/Living
        value={value}
        style={{ width: '100%', minWidth: '8em' }}
      />
    </Hoverable>
  );
};

export default LanguageVitalityMeter;
