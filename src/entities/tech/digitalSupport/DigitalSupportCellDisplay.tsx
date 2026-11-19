import React from 'react';

import usePageParams from '@features/params/usePageParams';
import { getColorGradientFunction } from '@features/transforms/coloring/getColorGradientFunction';

const VERSION: number = 2;

const DigitalSupportCellDisplay: React.FC<{ score: number }> = ({ score }) => {
  const { colorGradient } = usePageParams();
  const applyColorGradient = getColorGradientFunction(colorGradient);

  if (VERSION === 1) {
    return (
      <meter
        min={0} // Extinct
        low={3} // Rarely supported -- below this, the meter is colored red
        high={7} // -- below this, the meter is colored yellow
        optimum={8} // Functional just not always fully supported -- tells the renderer that high and above is green
        max={10} // Fully supported
        value={score}
        className="w-full min-w-4"
      />
    );
  }
  if (VERSION === 2) {
    return (
      <div className="p-1">
        <div
          className="rounded w-full min-w-4 px-2 text-center"
          style={{ backgroundColor: applyColorGradient(score / 10) }}
        >
          {score < 10 && <span className="opacity-0">0</span>}
          {score.toFixed(0)} <span className="text-xs opacity-20">/10</span>
        </div>
      </div>
    );
  }
  {
    /* <DecimalNumber
                  num={getGroupedDigitalSupportFactorScore(ent, tier, cat, factor)}
                /> */
  }
};

export default DigitalSupportCellDisplay;
