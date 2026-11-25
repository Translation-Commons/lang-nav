import React, { PropsWithChildren, useCallback, useMemo, useState } from 'react';

import {
    AllDigitalSupportCategories,
    AllDigitalSupportTiers,
    DigitalSupportCategory,
    DigitalSupportCategoryFactors,
    DigitalSupportColumn,
    DigitalSupportTier,
    DigitalSupportTierCategories,
} from './DigitalSupportTypes';

type DigitalSupportContextType = {
  openTiers: DigitalSupportTier[];
  setOpenTiers: React.Dispatch<React.SetStateAction<DigitalSupportTier[]>>;
  toggleTier: (tier: DigitalSupportTier) => void;

  openCats: DigitalSupportCategory[];
  setOpenCats: React.Dispatch<React.SetStateAction<DigitalSupportCategory[]>>;
  toggleCat: (cat: DigitalSupportCategory) => void;

  showValues: boolean;
  setShowValues: React.Dispatch<React.SetStateAction<boolean>>;

  visibleColumns: DigitalSupportColumn[];
};

const DigitalSupportContext = React.createContext<DigitalSupportContextType>({
  openTiers: [],
  setOpenTiers: () => {},
  toggleTier: () => {},

  openCats: [],
  setOpenCats: () => {},
  toggleCat: () => {},

  visibleColumns: [],

  showValues: false,
  setShowValues: () => {},
});

export const DigitalSupportProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [openTiers, setOpenTiers] = useState<DigitalSupportTier[]>(AllDigitalSupportTiers);
  const [showValues, setShowValues] = useState(false);
  const [openCats, setOpenCats] = useState<DigitalSupportCategory[]>(AllDigitalSupportCategories);
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
    <DigitalSupportContext.Provider
      value={{
        openTiers,
        setOpenTiers,
        toggleTier,

        openCats,
        setOpenCats,
        toggleCat,

        visibleColumns,

        showValues,
        setShowValues,
      }}
    >
      {children}
    </DigitalSupportContext.Provider>
  );
};

export const useDigitalSupportContext = () => {
  return React.useContext(DigitalSupportContext);
};

export default DigitalSupportContext;
