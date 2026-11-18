import { ChevronLeftIcon } from 'lucide-react';
import React from 'react';

import { sumBy } from '@shared/lib/setUtils';
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
        {Object.values(DigitalSupportTier)
          .filter((v) => typeof v === 'number')
          .map((tier) => (
            <TierHeader
              key={tier}
              tier={tier}
              openTiers={openTiers}
              openCats={openCats}
              toggleTier={toggleTier}
            />
          ))}
      </tr>
      <tr>
        <th colSpan={2}>Language</th>
        {Object.values(DigitalSupportTier)
          .filter((v) => typeof v === 'number')
          .flatMap((tier) =>
            openTiers.includes(tier) ? (
              DigitalSupportTierCategories[tier].map((cat) => (
                <CategoryHeader key={cat} cat={cat} openCats={openCats} toggleCat={toggleCat} />
              ))
            ) : (
              <th className="p-1 text-sm font-medium text-nowrap">
                All {DigitalSupportTierCategories[tier].length} categories
              </th>
            ),
          )}
      </tr>
      <tr>
        <th>Code</th>
        <th>Name</th>
        {visibleColumns.map(({ tier, cat, factor }, index) => (
          <FactorHeader key={index} tier={tier} cat={cat} factor={factor} />
        ))}
      </tr>
    </thead>
  );
};

const TierHeader: React.FC<{
  tier: DigitalSupportTier;
  openTiers: DigitalSupportTier[];
  openCats: DigitalSupportCategory[];
  toggleTier: (tier: DigitalSupportTier) => void;
}> = ({ tier, openTiers, openCats, toggleTier }) => {
  let colSpan = 1;
  if (openTiers.includes(tier)) {
    colSpan = sumBy(DigitalSupportTierCategories[tier], (cat) =>
      openCats.includes(cat) ? getFactorCount(cat) : 1,
    );
  }
  return (
    <th colSpan={colSpan}>
      <Toggle
        pressed={openTiers.includes(tier)}
        onPressedChange={() => toggleTier(tier)}
        className="group text-md w-full justify-start"
      >
        {DigitalSupportTier[tier]}
        <ChevronLeftIcon className="group-aria-pressed:rotate-[-90deg] transition-transform" />
      </Toggle>
    </th>
  );
};

const CategoryHeader: React.FC<{
  cat: DigitalSupportCategory;
  openCats: DigitalSupportCategory[];
  toggleCat: (cat: DigitalSupportCategory) => void;
}> = ({ cat, openCats, toggleCat }) => {
  const colSpan = openCats.includes(cat) ? getFactorCount(cat) : 1;

  return (
    <th colSpan={colSpan}>
      <Toggle
        pressed={openCats.includes(cat)}
        onPressedChange={() => toggleCat(cat)}
        className="group text-sm w-full justify-start"
      >
        {getDigitalSupportCategoryLabel(cat)}
        <ChevronLeftIcon className="group-aria-pressed:rotate-[-90deg] transition-transform" />
      </Toggle>
    </th>
  );
};

const FactorHeader: React.FC<{
  tier: DigitalSupportTier;
  cat?: DigitalSupportCategory;
  factor?: DigitalSupportFactor;
}> = ({ tier, cat, factor }) => {
  let label = '';

  if (cat == null)
    label = `All ${sumBy(DigitalSupportTierCategories[tier], (cat) => getFactorCount(cat))} factors`;
  else if (factor == null)
    label = getFactorCount(cat) > 1 ? `All ${getFactorCount(cat)} factors` : `1 factor`;
  else label = DigitalSupportFactor[factor];

  return <th className="p-1 text-xs font-medium text-nowrap">{label}</th>;
};

export default DigitalSupportTableHeader;
