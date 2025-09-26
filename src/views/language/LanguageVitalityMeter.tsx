import React from 'react';

import Deemphasized from '../../generic/Deemphasized';
import Hoverable from '../../generic/Hoverable';
import { LanguageData } from '../../types/LanguageTypes';

import { computeVitalityMetascore } from './LanguageVitalityComputation';

interface Props {
  lang: LanguageData;
}

const LanguageVitalityMeter: React.FC<Props> = ({ lang }) => {
  const metascore = computeVitalityMetascore(lang);

  if (metascore.score === null) {
    return <Deemphasized>Data not available</Deemphasized>;
  }

  return (
    <Hoverable
      hoverContent={`Vitality Metascore: ${metascore.score.toFixed(1)} (${metascore.explanation})`}
    >
      <meter
        min={0} // Extinct
        low={3} // Shifting/Endangered -- below this, the meter is colored red
        high={7} // Trade/Stable -- below this, the meter is colored yellow
        optimum={8} // Regional -- tells the renderer that high and above is green
        max={9} // National/Institutional/Living
        value={metascore.score}
        title={`Vitality Metascore: ${metascore.score.toFixed(1)}`}
        style={{ width: '100%', minWidth: '8em' }}
      />
    </Hoverable>
  );
};

export default LanguageVitalityMeter;
