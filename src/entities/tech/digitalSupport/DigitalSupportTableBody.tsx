import React from 'react';

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

type Props = {
  ents: LanguageData[];
  isPending: boolean;
  visibleColumns: DigitalSupportColumn[];
};

const DigitalSupportTableBody: React.FC<Props> = ({ ents, isPending, visibleColumns }) => {
  return (
    <tbody>
      {ents.map((ent) => (
        <tr key={ent.ID}>
          <td>{ent.codeDisplay}</td>
          <td>{ent.nameDisplay}</td>
          {visibleColumns.map(({ tier, cat, factor }, index) => (
            <td key={index} className="p-1">
              <meter
                min={0} // Extinct
                low={3} // Rarely supported -- below this, the meter is colored red
                high={7} // -- below this, the meter is colored yellow
                optimum={8} // Functional just not always fully supported -- tells the renderer that high and above is green
                max={10} // Fully supported
                value={getGroupedDigitalSupportFactorScore(ent, tier, cat, factor)}
                style={{ width: '100%', minWidth: '8em' }}
              />
              {/* <DecimalNumber
                  num={getGroupedDigitalSupportFactorScore(ent, tier, cat, factor)}
                /> */}
            </td>
          ))}
        </tr>
      ))}
      {ents.length === 0 && !isPending && (
        <tr>
          <td colSpan={2}>No entities found</td>
        </tr>
      )}
      {isPending && (
        <tr>
          <td colSpan={2}>Loading...</td>
        </tr>
      )}
    </tbody>
  );
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

export default DigitalSupportTableBody;
