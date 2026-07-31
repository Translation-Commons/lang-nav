import { AlertTriangleIcon } from 'lucide-react';
import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';

import { LanguageData } from '../LanguageTypes';

type Props = {
  lang: LanguageData;
  use: 'speaking' | 'writing';
};

/**
 * Now that we are showing a LOT of data, some datapoints just don't match the same quality.
 * This component gets ahead of that and puts warning over data that is known to be off.
 */
const LanguagePopulationKnownWarning: React.FC<Props> = ({ lang, use }) => {
  if (use === 'speaking') {
    if (!['kmb', 'nob', 'ndc'].includes(lang.ID)) return null;
  } else if (use === 'writing') {
    if (!['lah', 'arb', 'san'].includes(lang.ID)) return null;
  }

  return (
    <Hoverable hoverContent="This population estimate is certainly off, limited by currently available data">
      <AlertTriangleIcon className="text-yellow-500 w-4 h-4 inline-block mr-1" />
    </Hoverable>
  );
};

export default LanguagePopulationKnownWarning;
