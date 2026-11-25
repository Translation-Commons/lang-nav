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

export enum CellDesign {
  Meter = 'Meter',
  ColoredDiv = 'Colored Rectangle',
  Pie = 'Pie',
  SimplePie = 'Quarter Pie',
}

type DigitalSupportContextType = {
  openTiers: DigitalSupportTier[];
  setOpenTiers: React.Dispatch<React.SetStateAction<DigitalSupportTier[]>>;
  toggleTier: (tier: DigitalSupportTier) => void;

  openCats: DigitalSupportCategory[];
  setOpenCats: React.Dispatch<React.SetStateAction<DigitalSupportCategory[]>>;
  toggleCat: (cat: DigitalSupportCategory) => void;

  visibleColumns: DigitalSupportColumn[];

  showValues: boolean;
  setShowValues: React.Dispatch<React.SetStateAction<boolean>>;
  cellDesign: CellDesign;
  setCellDesign: React.Dispatch<React.SetStateAction<CellDesign>>;
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
  cellDesign: CellDesign.ColoredDiv,
  setCellDesign: () => {},
});

export const DigitalSupportProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [openTiers, setOpenTiers] = useState<DigitalSupportTier[]>(AllDigitalSupportTiers);
  const [showValues, setShowValues] = useState(false);
  const [cellDesign, setCellDesign] = useState(CellDesign.ColoredDiv);
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
        cellDesign,
        setCellDesign,
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
