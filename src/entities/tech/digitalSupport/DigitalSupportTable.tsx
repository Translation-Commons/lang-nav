import React, { useCallback, useMemo, useState } from 'react';

import { LanguageData } from '@entities/language/LanguageTypes';

import { Button } from '@shared/ui/button';

import DigitalSupportTableBody from './DigitalSupportTableBody';
import DigitalSupportTableHeader from './DigitalSupportTableHeader';
import {
  AllDigitalSupportCategories,
  AllDigitalSupportTiers,
  DigitalSupportCategory,
  DigitalSupportCategoryFactors,
  DigitalSupportColumn,
  DigitalSupportTier,
  DigitalSupportTierCategories,
} from './DigitalSupportTypes';

type Props = {
  ents: LanguageData[];
  isPending: boolean;
};

const DigitalSupportTable: React.FC<Props> = ({ ents, isPending }) => {
  const [openTiers, setOpenTiers] = useState<DigitalSupportTier[]>(
    Object.values(DigitalSupportTier).filter((v) => typeof v === 'number'),
  );
  const [openCats, setOpenCats] = useState<DigitalSupportCategory[]>([]);
  const toggleTier = useCallback((tier: DigitalSupportTier) => {
    setOpenTiers((prev) =>
      prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier],
    );
  }, []);
  const toggleCat = useCallback((cat: DigitalSupportCategory) => {
    setOpenCats((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  }, []);

  const visibleColumns: DigitalSupportColumn[] = useMemo(() => {
    return Object.values(DigitalSupportTier)
      .filter((v) => typeof v === 'number')
      .flatMap((tier) => [
        { tier, showData: !openTiers.includes(tier) },
        ...DigitalSupportTierCategories[tier].flatMap((cat) => [
          { tier, cat, showData: openTiers.includes(tier) && !openCats.includes(cat) },
          ...DigitalSupportCategoryFactors[cat].map((factor) => ({
            tier,
            cat,
            factor,
            showData: openTiers.includes(tier) && openCats.includes(cat),
          })),
        ]),
      ]);
  }, [openTiers, openCats]);

  return (
    <>
      <div>
        <Button
          variant="ghost"
          onClick={() =>
            setOpenTiers((prev) =>
              prev.length === AllDigitalSupportTiers.length ? [] : AllDigitalSupportTiers,
            )
          }
        >
          {openTiers.length === AllDigitalSupportTiers.length
            ? 'Collapse all tiers'
            : 'Expand all tiers'}
        </Button>
        <Button
          variant="ghost"
          onClick={() =>
            setOpenCats((prev) =>
              prev.length === AllDigitalSupportCategories.length ? [] : AllDigitalSupportCategories,
            )
          }
          disabled={openTiers.length === 0}
        >
          {openCats.length === AllDigitalSupportCategories.length
            ? 'Collapse all categories'
            : 'Expand all categories'}
        </Button>
      </div>{' '}
      <div className="max-w-200 max-h-200 truncate overflow-auto relative">
        <table>
          <colgroup>
            <col className="sticky left-0 bg-background z-15" />
            <col className="sticky left-0 bg-background z-15" />
            {visibleColumns.map(({ cat }, index) => (
              <col key={index} className={cat == null ? 'border-l-2' : ''} />
            ))}
          </colgroup>
          <DigitalSupportTableHeader
            openTiers={openTiers}
            openCats={openCats}
            toggleTier={toggleTier}
            toggleCat={toggleCat}
            visibleColumns={visibleColumns}
          />
          <DigitalSupportTableBody
            ents={ents}
            isPending={isPending}
            visibleColumns={visibleColumns}
          />
        </table>
      </div>
    </>
  );
};

export default DigitalSupportTable;
