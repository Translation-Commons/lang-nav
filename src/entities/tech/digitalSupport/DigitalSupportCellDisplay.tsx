import React from 'react';

import usePageParams from '@features/params/usePageParams';
import { getColorGradientFunction } from '@features/transforms/coloring/getColorGradientFunction';

import { LanguageData } from '@entities/language/LanguageTypes';

import { sumBy } from '@shared/lib/setUtils';

import {
  DigitalSupportCategory,
  DigitalSupportCategoryFactors,
  DigitalSupportColumn,
  DigitalSupportFactor,
  DigitalSupportTier,
  DigitalSupportTierCategories,
} from './DigitalSupportTypes';
import getDigitalSupportFactorScore from './getDigitalSupportFactorScore';

type Props = DigitalSupportColumn & {
  design?: '1' | '2';
  ent: LanguageData;
  showValues: boolean;
};

const DigitalSupportCellDisplay: React.FC<Props> = ({
  ent,
  tier,
  cat,
  factor,
  design = '2',
  showValues = true,
}) => {
  const { colorGradient } = usePageParams();
  const applyColorGradient = getColorGradientFunction(colorGradient);
  const score = getGroupedDigitalSupportFactorScore(ent, tier, cat, factor);

  if (design === '1') {
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
  if (design === '2') {
    return (
      <div
        className="rounded w-full min-w-4 px-2 text-center"
        style={{ backgroundColor: applyColorGradient(score / 10) }}
      >
        {showValues ? (
          <>
            {score < 10 && <span className="opacity-0">0</span>}
            {score.toFixed(1)} <span className="text-xs opacity-30">/10</span>
          </>
        ) : (
          <div className="h-4" />
        )}
      </div>
    );
  }
  // if (design === '3') {
  //   // pie chart
  //   return <svg>

  //   </svg>;
  // }
};

function getGroupedDigitalSupportFactorScore(
  ent: LanguageData,
  tier: DigitalSupportTier,
  cat?: DigitalSupportCategory,
  factor?: DigitalSupportFactor,
): number {
  if (cat == null) {
    return (
      sumBy(DigitalSupportTierCategories[tier], (c) =>
        getGroupedDigitalSupportFactorScore(ent, tier, c),
      ) / DigitalSupportTierCategories[tier].length
    );
  }
  if (factor == null) {
    return (
      sumBy(DigitalSupportCategoryFactors[cat], (f) => getDigitalSupportFactorScore(ent, f)) /
      DigitalSupportCategoryFactors[cat].length
    );
  }
  return getDigitalSupportFactorScore(ent, factor);
}

export default DigitalSupportCellDisplay;
