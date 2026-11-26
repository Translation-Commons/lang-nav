import { SquareCheckIcon, SquareIcon, SquareMinusIcon } from 'lucide-react';
import React from 'react';

import { Button } from '@shared/ui/button';
import EnumDropdown from '@shared/ui/EnumDropdown';

import { CellDesign, useDigitalSupportContext } from './DigitalSupportContext';
import { AllDigitalSupportCategories, AllDigitalSupportTiers } from './DigitalSupportTypes';

const DigitalSupportOptions: React.FC = () => {
  const {
    openTiers,
    setOpenTiers,
    openCats,
    setOpenCats,
    showValues,
    setShowValues,
    cellDesign,
    setCellDesign,
  } = useDigitalSupportContext();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        onClick={() =>
          setOpenTiers((prev) =>
            prev.length === AllDigitalSupportTiers.length ? [] : AllDigitalSupportTiers,
          )
        }
      >
        {openTiers.length === AllDigitalSupportTiers.length ? (
          <SquareCheckIcon />
        ) : openTiers.length === 0 ? (
          <SquareIcon />
        ) : (
          <SquareMinusIcon />
        )}
        {openTiers.length === AllDigitalSupportTiers.length
          ? 'All tiers expanded'
          : openTiers.length === 0
            ? 'All tiers collapsed'
            : 'Some tiers expanded'}
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
        {openCats.length === AllDigitalSupportCategories.length ? (
          <SquareCheckIcon />
        ) : openCats.length === 0 ? (
          <SquareIcon />
        ) : (
          <SquareMinusIcon />
        )}

        {openCats.length === AllDigitalSupportCategories.length
          ? 'All categories expanded'
          : openCats.length === 0
            ? 'All categories collapsed'
            : 'Some categories expanded'}
      </Button>
      <Button variant="ghost" onClick={() => setShowValues((prev) => !prev)}>
        {showValues ? <SquareCheckIcon /> : <SquareIcon />}
        {showValues ? 'Showing numbers' : 'Hiding numbers'}
      </Button>
      <EnumDropdown
        value={cellDesign}
        options={Object.values(CellDesign)}
        onChange={setCellDesign}
      />
    </div>
  );
};

export default DigitalSupportOptions;
