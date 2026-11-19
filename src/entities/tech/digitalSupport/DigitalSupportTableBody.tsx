import React from 'react';

import { LanguageData } from '@entities/language/LanguageTypes';

import { sumBy } from '@shared/lib/setUtils';
import { cn } from '@shared/lib/utils';

import DigitalSupportCellDisplay from './DigitalSupportCellDisplay';
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
          {visibleColumns.map(({ tier, cat, factor, showData }, index) => (
            <td key={index} className="">
              <div
                className={cn('truncate transition-w duration-1000', !showData ? 'w-0' : 'w-20')}
              >
                <DigitalSupportCellDisplay
                  score={getGroupedDigitalSupportFactorScore(ent, tier, cat, factor)}
                />
              </div>
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
