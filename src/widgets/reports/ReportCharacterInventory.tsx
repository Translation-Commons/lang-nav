import React from 'react';

import usePageParams from '@features/params/usePageParams';

import CharacterInventoryParamsProvider from '@entities/orthography/character_inventory/CharacterInventoryContext';
import CharacterInventoryOptions from '@entities/orthography/character_inventory/CharacterInventoryOptions';
import CharacterInventoryTable from '@entities/orthography/character_inventory/CharacterInventoryTable';

const ReportCharacterInventory: React.FC = () => {
  const { writingSystemFilter } = usePageParams();

  return (
    <CharacterInventoryParamsProvider>
      <div className="flex flex-col gap-4">
        <div>
          This shows a comparison of the characters found in the entries. This is a bit experimental
          and will need some refinement -- please submit feedback via the button in the top-right.
        </div>
        <CharacterInventoryOptions />
        {!writingSystemFilter && (
          <div>Please select a writing system to view character inventory.</div>
        )}
        {writingSystemFilter && <CharacterInventoryTable />}
      </div>
    </CharacterInventoryParamsProvider>
  );
};

export default ReportCharacterInventory;
