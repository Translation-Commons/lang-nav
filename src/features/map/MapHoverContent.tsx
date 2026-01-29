import React from 'react';

import { ObjectType } from '@features/params/PageParamTypes';

import CensusesInTerritory from '@entities/census/CensusesInTerritory';
import LocalesInTerritoryCard from '@entities/locale/LocalesInTerritoryCard';
import ObjectCard from '@entities/ui/ObjectCard';
import WritingSystemsInTerritoryCard from '@entities/writingsystem/WritingSystemsInTerritoryCard';

import DrawableData from './DrawableData';

const MapHoverContent: React.FC<{
  drawnObject: DrawableData;
  objectType: ObjectType;
}> = ({ drawnObject, objectType }) => {
  if (objectType === ObjectType.Census && drawnObject.type === ObjectType.Territory)
    return <CensusesInTerritory territory={drawnObject} />;
  if (objectType === ObjectType.Locale && drawnObject.type === ObjectType.Territory)
    return <LocalesInTerritoryCard territory={drawnObject} />;
  if (objectType === ObjectType.WritingSystem && drawnObject.type === ObjectType.Territory)
    return <WritingSystemsInTerritoryCard territory={drawnObject} />;

  return (
    <div>
      Click to see more information in the details panel.
      <ObjectCard object={drawnObject} />
    </div>
  );
};

export default MapHoverContent;
