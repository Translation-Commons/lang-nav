import React, { useCallback, useMemo, useState } from 'react';

import { LanguageData } from '@entities/language/LanguageTypes';

import DigitalSupportTableBody from './DigitalSupportTableBody';
import DigitalSupportTableHeader from './DigitalSupportTableHeader';
import {
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
  const [openTiers, setOpenTiers] = useState<DigitalSupportTier[]>([]);
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
    <table>
      <DigitalSupportTableHeader
        openTiers={openTiers}
        openCats={openCats}
        toggleTier={toggleTier}
        toggleCat={toggleCat}
        visibleColumns={visibleColumns}
      />
      <DigitalSupportTableBody ents={ents} isPending={isPending} visibleColumns={visibleColumns} />
    </table>
  );
};

export default DigitalSupportTable;
