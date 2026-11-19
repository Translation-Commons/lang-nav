import React from 'react';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';

import { LanguageData } from '@entities/language/LanguageTypes';

import { sumBy } from '@shared/lib/setUtils';
import { cn } from '@shared/lib/utils';
import { Skeleton } from '@shared/ui/skeleton';

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
          <td className="pr-1">{ent.codeDisplay}</td>
          <td className="text-nowrap pr-1">
            <HoverableEntityName ent={ent} />
          </td>
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
          <td colSpan={visibleColumns.length}></td>
        </tr>
      )}
      {isPending && (
        <tr>
          <td colSpan={2}>Loading...</td>
          <td colSpan={visibleColumns.length}>
            <Skeleton className="h-4 w-full" />
          </td>
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
