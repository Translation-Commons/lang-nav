import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import { ObjectType } from '@features/params/PageParamTypes';

import { ObjectData, TerritoryData } from '@entities/types/DataTypes';
import ObjectCard from '@entities/ui/ObjectCard';

const MapHoverContent: React.FC<{
  territory: TerritoryData;
  objects: ObjectData[];
  objectType: ObjectType;
}> = ({ territory, objects, objectType }) => {
  if (objectType === ObjectType.Census) {
    const censusesInTerritory = objects.filter(
      (obj) => obj.type === ObjectType.Census && obj.territory?.ID === territory.ID,
    );
    return (
      <div>
        <div style={{ fontWeight: 'bold' }}>{territory.nameDisplay}</div>
        There are {censusesInTerritory.length} census tables in this territory:
        {censusesInTerritory.map((census) => (
          <div key={census.ID}>
            <HoverableObjectName object={census} />
          </div>
        ))}
      </div>
    );
  }
  return <ObjectCard object={territory} />;
};

export default MapHoverContent;
