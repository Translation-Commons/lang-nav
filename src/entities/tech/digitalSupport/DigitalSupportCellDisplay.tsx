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
          low={30} // Rarely supported -- below this, the meter is colored red
          high={75} // -- below this, the meter is colored yellow
          optimum={85} // Functional just not always fully supported -- tells the renderer that high and above is green
          max={100} // Fully supported
          value={score}
          className="w-full min-w-4"
        ></meter>
        {showValues && <div className="mt-[-4px] text-xs opacity-30">{score.toFixed(0)}</div>}
      </>
    );
  }
  if (cellDesign === CellDesign.PartialRectangle) {
    return (
      <div className="rounded w-full min-w-4 px-2 text-center relative">
        <div
          className="h-full absolute top-0 left-0 -z-10 rounded"
          style={{
            width: score + '%',
            backgroundColor: applyColorGradient(score / 100),
          }}
        />
        {showValues ? (
          <div>
            {score < 100 && <span className="opacity-0">0</span>}
            {score < 10 && <span className="opacity-0">0</span>}
            {score.toFixed(0)}
          </div>
        ) : (
          <div className="h-4" />
        )}
      </div>
    );
  }
  if (cellDesign === CellDesign.FullRectangle) {
    return (
      <div
        className="rounded w-full min-w-4 px-2 text-center"
        style={{ backgroundColor: applyColorGradient(score / 100) }}
      >
        {showValues ? (
          <>
            {score < 100 && <span className="opacity-0">0</span>}
            {score < 10 && <span className="opacity-0">0</span>}
            {score.toFixed(0)}
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
        fraction={score / 100}
        size={showValues ? 24 : 16}
        color={applyColorGradient(score / 100)}
        label={showValues ? score.toFixed(0) : ''}
      />
    );
  }
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
