import { ChevronLeftIcon, ExpandIcon } from 'lucide-react';
import React, { ReactNode } from 'react';

import { sumBy } from '@shared/lib/setUtils';
import { cn } from '@shared/lib/utils';
import { Button } from '@shared/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@shared/ui/hover-card';

import {
  getDigitalSupportCategoryLabel,
  getDigitalSupportFactorLabel,
} from '@strings/DigitalSupportStrings';

import { CellDesign, useDigitalSupportContext } from './DigitalSupportContext';
import { DigitalSupportCategoryIcon, DigitalSupportFactorIcon } from './DigitalSupportIcons';
import { getColumnWidth } from './DigitalSupportTableBody';
import {
  DigitalSupportCategory,
  DigitalSupportCategoryFactors,
  DigitalSupportColumn,
  DigitalSupportTier,
  DigitalSupportTierCategories,
} from './DigitalSupportTypes';

const getFactorCount = (cat: DigitalSupportCategory) => {
  return DigitalSupportCategoryFactors[cat].length || 1;
};

const DigitalSupportTableHeader: React.FC = () => {
  const { openTiers, toggleTier, visibleColumns } = useDigitalSupportContext();

  return (
    <thead className="sticky top-0 bg-background z-10">
      <tr>
        <th colSpan={2} className="sticky left-0 bg-transparent z-10">
          <div className="h-full w-fit bg-background">Language</div>
        </th>
        {Object.values(DigitalSupportTier)
          .filter((v) => typeof v === 'number')
          .map((tier) => (
            <TierHeader key={tier} tier={tier} />
          ))}
      </tr>
      <tr>
        <th className="pr-1 sticky left-0 bg-background z-15">Code</th>
        <th className="px-1">Name</th>
        {Object.values(DigitalSupportTier)
          .filter((v) => typeof v === 'number')
          .flatMap((tier) => [
            <th key={`${tier}-cat-head`} className={'text-sm font-medium text-nowrap'}>
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
              <CategoryHeader key={cat} tier={tier} cat={cat} />
            )),
          ])}
      </tr>
      <tr>
        <th className="sticky left-0 bg-background z-15"></th>
        <th />
        {visibleColumns.map((column, index) => (
          <FactorHeader key={index} {...column} />
        ))}
      </tr>
    </thead>
  );
};

const TierHeader: React.FC<{
  tier: DigitalSupportTier;
}> = ({ tier }) => {
  const { openTiers, toggleTier } = useDigitalSupportContext();
  const isExpanded = openTiers.includes(tier);

  const colSpan =
    sumBy(DigitalSupportTierCategories[tier], getFactorCount) +
    DigitalSupportTierCategories[tier].length +
    1;
  return (
    <th colSpan={colSpan} className="border-l-2">
      <div className="px-1 flex items-center flex-row gap-1">
        <Button
          variant="ghost"
          onClick={() => toggleTier(tier)}
          className="w-full font-bold text-md"
        >
          {DigitalSupportTier[tier]}
          <ChevronLeftIcon
            className={cn('transition-transform', isExpanded && 'rotate-[-90deg]')}
          />
        </Button>
      </div>
    </th>
  );
};

const CategoryHeader: React.FC<{
  tier: DigitalSupportTier;
  cat: DigitalSupportCategory;
}> = ({ tier, cat }) => {
  const { openTiers, openCats, toggleCat, showValues, cellDesign } = useDigitalSupportContext();
  const tierIsOpen = openTiers.includes(tier);
  const isExpanded = tierIsOpen && openCats.includes(cat);

  return (
    <th colSpan={getFactorCount(cat) + 1} className={cn('font-medium')}>
      <div
        className={cn(
          'w-full text-xs flex flex-row items-center truncate transition-all duration-1000 @container',
          tierIsOpen
            ? isExpanded
              ? 'max-w-40'
              : getColumnWidth(cellDesign, showValues, tierIsOpen, cat)
            : 'w-0',
        )}
      >
        <HoverCard>
          <HoverCardTrigger
            delay={200}
            render={
              <Button
                className="w-full"
                onClick={() => toggleCat(cat)}
                variant="ghost"
                aria-label={getDigitalSupportCategoryLabel(cat) + ', click to toggle category'}
              >
                <DigitalSupportCategoryIcon cat={cat} />
                <div className="hidden @min-[120px]:block shrink truncate">
                  {getDigitalSupportCategoryLabel(cat)}
                </div>
                <ChevronLeftIcon
                  className={cn(
                    'transition-transform @max-[40px]:hidden',
                    isExpanded && 'rotate-[-90deg]',
                  )}
                />
              </Button>
            }
          />
          <HoverCardContent className="w-fit">
            <strong>{getDigitalSupportCategoryLabel(cat)}</strong>
            <div>Click to {isExpanded ? 'hide' : 'show'} factors in the category</div>
          </HoverCardContent>
        </HoverCard>
      </div>
    </th>
  );
};

const FactorHeader: React.FC<DigitalSupportColumn> = ({ tier, cat, factor, showData }) => {
  const { openTiers, toggleCat, showValues, cellDesign } = useDigitalSupportContext();
  const tierIsOpen = openTiers.includes(tier);

  let contents: ReactNode = '';

  if (cat == null) return <th></th>;
  else if (factor == null) {
    const factorCount = getFactorCount(cat);
    contents = (
      <HoverCard>
        <HoverCardTrigger
          className="px-1 flex truncate gap-1 cursor-help"
          aria-label={`Click to show all ${getDigitalSupportCategoryLabel(cat)} factors`}
          render={
            <Button variant="ghost" onClick={() => toggleCat(cat)}>
              {cellDesign === CellDesign.Pie && <ExpandIcon />}
              {showValues && cellDesign != CellDesign.Pie && factorCount > 1 && 'All '}
              {factorCount}
              {cellDesign != CellDesign.Pie && (factorCount > 1 ? ' factors' : ' factor')}
            </Button>
          }
        />
        <HoverCardContent className="max-w-40">
          Click to show all {getFactorCount(cat)} {getDigitalSupportCategoryLabel(cat)} factors in
          the category.
        </HoverCardContent>
      </HoverCard>
    );
  } else {
    contents = (
      <HoverCard>
        <HoverCardTrigger
          className="px-1 flex items-center gap-1 cursor-help"
          aria-label={getDigitalSupportFactorLabel(factor)}
        >
          <DigitalSupportFactorIcon factor={factor} />
          {/* {DigitalSupportFactor[factor]} */}
        </HoverCardTrigger>
        <HoverCardContent className="w-fit">
          <strong>{getDigitalSupportFactorLabel(factor)}</strong>
        </HoverCardContent>
      </HoverCard>
    );
  }

  return (
    <th>
      <div
        className={cn(
          'text-xs font-medium truncate transition-all duration-1000 justify-items-center',
          getColumnWidth(cellDesign, showValues, showData, cat, factor),
          tierIsOpen ? 'max-h-8' : 'max-h-0',
        )}
        title={
          factor == null
            ? `Click to show all ${getFactorCount(cat)} factors`
            : getDigitalSupportFactorLabel(factor)
        }
      >
        {contents}
      </div>
    </th>
  );
};

export default DigitalSupportTableHeader;
