import React from 'react';

import Deemphasized from '@shared/ui/Deemphasized';

import { LanguageData } from '../LanguageTypes';

import { DigitalSupportDimension } from './DigitalSupportTypes';

type Props = {
  lang: LanguageData;
  dim?: DigitalSupportDimension;
};

const LanguageDigitalSupportMeter: React.FC<Props> = ({
  lang,
  dim = DigitalSupportDimension.Overall,
}) => {
  const { digitalSupportScore } = lang;
  if (digitalSupportScore == null) return <Deemphasized>Not available</Deemphasized>;

  return (
    <meter
      min={0} // Extinct
      low={3} // Rarely supported -- below this, the meter is colored red
      high={7} // -- below this, the meter is colored yellow
      optimum={8} // Functional just not always fully supported -- tells the renderer that high and above is green
      max={10} // Fully supported
      value={digitalSupportScore[dim]}
      style={{ width: '100%', minWidth: '8em' }}
    />
  );
};

export default LanguageDigitalSupportMeter;
