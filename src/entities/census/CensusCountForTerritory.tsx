import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';
import { View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { TerritoryData } from '@entities/territory/TerritoryTypes';
import { EntityType } from '@entities/types/EntityTypes';

import Deemphasized from '@shared/ui/Deemphasized';

import CensusesInTerritory from './CensusesInTerritory';

const CensusCountForTerritory: React.FC<{ territory: TerritoryData }> = ({ territory }) => {
  const { updatePageParams } = usePageParams();

  return (
    <Hoverable
      hoverContent={<CensusesInTerritory territory={territory} />}
      onClick={() =>
        updatePageParams({
          view: View.Table,
          entType: EntityType.Census,
          territoryFilter: territory.ID,
        })
      }
    >
      {territory.censuses?.length || <Deemphasized>—</Deemphasized>}
    </Hoverable>
  );
};

export default CensusCountForTerritory;
