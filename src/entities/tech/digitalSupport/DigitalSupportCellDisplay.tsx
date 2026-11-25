import React from 'react';

import usePageParams from '@features/params/usePageParams';
import { getColorGradientFunction } from '@features/transforms/coloring/getColorGradientFunction';

import { LanguageData } from '@entities/language/LanguageTypes';

import { sumBy } from '@shared/lib/setUtils';
import Pie from '@shared/ui/Pie';

import { CellDesign, useDigitalSupportContext } from './DigitalSupportContext';
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
  ent: LanguageData;
};

const DigitalSupportCellDisplay: React.FC<Props> = ({ ent, tier, cat, factor }) => {
  const { colorGradient } = usePageParams();
  const { showValues, cellDesign } = useDigitalSupportContext();
  const applyColorGradient = getColorGradientFunction(colorGradient);
  const score = getGroupedDigitalSupportFactorScore(ent, tier, cat, factor);

  if (cellDesign === CellDesign.Meter) {
    return (
      <>
        <meter
          min={0} // Extinct
          low={3} // Rarely supported -- below this, the meter is colored red
          high={7} // -- below this, the meter is colored yellow
          optimum={8} // Functional just not always fully supported -- tells the renderer that high and above is green
          max={10} // Fully supported
          value={score}
          className="w-full min-w-4"
        >
          {/* {showValues && score.toFixed(1)} */}
          {/* <span className="sr-only">{score.toFixed(1)} / 10</span> */}
        </meter>
        {showValues && <div className="mt-[-4px] text-xs opacity-30">{score.toFixed(1)} / 10</div>}
      </>
    );
  }
  if (cellDesign === CellDesign.ColoredDiv) {
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
  if (cellDesign === CellDesign.Pie) {
    // pie chart
    return (
      <Pie
        fraction={score / 10}
        size={showValues ? 24 : 16}
        color={applyColorGradient(score / 10)}
        label={showValues ? score.toFixed(1) : ''}
      />
    );
  }

  if (cellDesign === CellDesign.SimplePie) {
    return (
      <div
        className="rounded w-full min-w-4 text-center leading-4"
        style={{ color: applyColorGradient(score / 10) }}
      >
        {getPartiallyFilledCircleChar(score)}
      </div>
    );
  }
};

function getPartiallyFilledCircleChar(score: number) {
  if (score === 0) return '○';
  if (score <= 2.5) return '◔';
  if (score <= 5) return '◑';
  if (score <= 7.5) return '◕';
  return '●';
}

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
