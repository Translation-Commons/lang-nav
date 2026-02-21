import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';
import { ObjectType, View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { TerritoryData } from '@entities/territory/TerritoryTypes';

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
          objectType: ObjectType.Census,
          territoryFilter: territory.ID,
        })
      }
    >
      {territory.censuses?.length || <Deemphasized>—</Deemphasized>}
    </Hoverable>
  );
};

export default CensusCountForTerritory;
