import { ChevronLeftIcon } from 'lucide-react';
import React, { ReactNode } from 'react';

import { sumBy } from '@shared/lib/setUtils';
import { cn } from '@shared/lib/utils';
import { Button } from '@shared/ui/button';
import { Toggle } from '@shared/ui/toggle';

import { getDigitalSupportCategoryLabel } from '@strings/DigitalSupportStrings';

import {
  DigitalSupportCategory,
  DigitalSupportCategoryFactors,
  DigitalSupportColumn,
  DigitalSupportFactor,
  DigitalSupportTier,
  DigitalSupportTierCategories,
} from './DigitalSupportTypes';

const getFactorCount = (cat: DigitalSupportCategory) => {
  return DigitalSupportCategoryFactors[cat].length || 1;
};

type Props = {
  openTiers: DigitalSupportTier[];
  openCats: DigitalSupportCategory[];
  toggleTier: (tier: DigitalSupportTier) => void;
  toggleCat: (cat: DigitalSupportCategory) => void;
  visibleColumns: DigitalSupportColumn[];
};

const DigitalSupportTableHeader: React.FC<Props> = ({
  openTiers,
  openCats,
  toggleTier,
  toggleCat,
  visibleColumns,
}) => {
  return (
    <thead>
      <tr>
        <th colSpan={2}></th>
        {/* {visibleColumns
          .filter((column) => column.cat == null)
          .map((col) => (
            <TierHeader
              key={col.tier}
              tier={col.tier}
              isExpanded={openTiers.includes(col.tier)}
              toggleTier={toggleTier}
            />
          ))} */}
        {Object.values(DigitalSupportTier)
          .filter((v) => typeof v === 'number')
          .map((tier) => (
            <TierHeader
              key={tier}
              tier={tier}
              isExpanded={openTiers.includes(tier)}
              toggleTier={toggleTier}
            />
          ))}
      </tr>
      <tr>
        <th colSpan={2}>Language</th>
        {Object.values(DigitalSupportTier)
          .filter((v) => typeof v === 'number')
          .flatMap((tier) => [
            <th key={`${tier}-cat-head`} className={cn('text-sm font-medium text-nowrap ')}>
              <div
                className={cn(
                  'transition-all truncate duration-1000',
                  openTiers.includes(tier) ? 'w-0' : 'w-30',
                )}
              >
                <Button variant="ghost" onClick={() => toggleTier(tier)}>
                  All {DigitalSupportTierCategories[tier].length} categories
                </Button>
              </div>
            </th>,
            ...DigitalSupportTierCategories[tier].map((cat) => (
              <CategoryHeader
                key={cat}
                cat={cat}
                isExpanded={openTiers.includes(tier) && openCats.includes(cat)}
                showCategory={openTiers.includes(tier)}
                toggleCat={toggleCat}
              />
            )),
          ])}
      </tr>
      <tr>
        <th>Code</th>
        <th>Name</th>
        {visibleColumns.map((column, index) => (
          <FactorHeader key={index} {...column} toggleCat={toggleCat} />
        ))}
      </tr>
    </thead>
  );
};

const TierHeader: React.FC<{
  tier: DigitalSupportTier;
  isExpanded: boolean;
  toggleTier: (tier: DigitalSupportTier) => void;
}> = ({ tier, isExpanded, toggleTier }) => {
  const colSpan =
    sumBy(DigitalSupportTierCategories[tier], getFactorCount) +
    DigitalSupportTierCategories[tier].length +
    1;
  return (
    <th colSpan={colSpan} className="border-r-2">
      <div className="px-1 flex items-center flex-row gap-1">
        {DigitalSupportTier[tier]}
        <Toggle pressed={isExpanded} onPressedChange={() => toggleTier(tier)} className="group">
          <ChevronLeftIcon className="group-aria-pressed:rotate-[-90deg] transition-transform" />
        </Toggle>
      </div>
    </th>
  );
};

const CategoryHeader: React.FC<{
  cat: DigitalSupportCategory;
  showCategory: boolean;
  isExpanded: boolean;
  toggleCat: (cat: DigitalSupportCategory) => void;
}> = ({ cat, isExpanded, toggleCat, showCategory }) => {
  return (
    <th colSpan={getFactorCount(cat) + 1} className="font-medium border-r-2">
      <div
        className={cn(
          'text-xs flex flex-row items-center truncate transition-all duration-1000',
          showCategory ? (isExpanded ? 'max-w-40' : 'w-20') : 'w-0',
        )}
      >
        <div className="text-wrap">{getDigitalSupportCategoryLabel(cat)}</div>
        <Toggle
          pressed={isExpanded}
          onPressedChange={() => toggleCat(cat)}
          className="group"
          size="sm"
        >
          <ChevronLeftIcon className="group-aria-pressed:rotate-[-90deg] transition-transform" />
        </Toggle>
      </div>
    </th>
  );
};

const FactorHeader: React.FC<
  DigitalSupportColumn & { toggleCat: (cat: DigitalSupportCategory) => void }
> = ({ cat, factor, showData, toggleCat }) => {
  let contents: ReactNode = '';

  if (cat == null) return <th></th>;
  else if (factor == null)
    contents = (
      <Button variant="ghost" onClick={() => toggleCat(cat)}>
        {getFactorCount(cat) > 1 ? `All ${getFactorCount(cat)} factors` : `1 factor`}
      </Button>
    );
  else contents = DigitalSupportFactor[factor];

  return (
    <th className="">
      <div
        className={cn(
          'text-xs font-medium truncate transition-all duration-1000',
          showData ? 'w-20' : 'w-0',
        )}
      >
        {contents}
      </div>
    </th>
  );
};

export default DigitalSupportTableHeader;
