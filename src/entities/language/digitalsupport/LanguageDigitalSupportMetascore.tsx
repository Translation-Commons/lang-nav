import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';

import Deemphasized from '@shared/ui/Deemphasized';

import { getDigitalSupportDimensionLabel } from '@strings/DigitalSupportStrings';

import { LanguageData } from '../LanguageTypes';

import LanguageDigitalSupportMeter from './DigitalSupportMeter';
import { DigitalSupportDimension } from './DigitalSupportTypes';

type Props = {
  lang: LanguageData;
};

const LanguageDigitalSupportMetascore: React.FC<Props> = ({ lang }) => {
  const { digitalSupportScore } = lang;
  if (digitalSupportScore == null) return <Deemphasized>Not available</Deemphasized>;

  return (
    <Hoverable
      hoverContent={Object.values(DigitalSupportDimension).map((dimension) => (
        <div key={dimension}>
          <strong>{getDigitalSupportDimensionLabel(dimension)}</strong>:{' '}
          {Math.floor(digitalSupportScore[dimension])}/10
          <LanguageDigitalSupportMeter lang={lang} dim={dimension} />
        </div>
      ))}
    >
      <LanguageDigitalSupportMeter lang={lang} />
    </Hoverable>
  );
};

export default LanguageDigitalSupportMetascore;
