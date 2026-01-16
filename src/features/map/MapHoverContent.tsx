import React from 'react';

import { ObjectType, View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import CensusesInTerritory from '@entities/census/CensusesInTerritory';
import LocalesInTerritoryCard from '@entities/locale/LocalesInTerritoryCard';
import ObjectCard from '@entities/ui/ObjectCard';

import DrawableData from './DrawableData';

const MapHoverContent: React.FC<{
  drawnObject: DrawableData;
  objectType: ObjectType;
}> = ({ drawnObject, objectType }) => {
  const { view } = usePageParams();

  if (objectType === ObjectType.Census && drawnObject.type === ObjectType.Territory)
    return <CensusesInTerritory territory={drawnObject} />;
  if (objectType === ObjectType.Locale && drawnObject.type === ObjectType.Territory)
    return <LocalesInTerritoryCard territory={drawnObject} />;

  return (
    <div>
      Click to{' '}
      {view === View.Details
        ? 'change the page to see the details for:'
        : 'open modal with more information for:'}
      <ObjectCard object={drawnObject} />
    </div>
  );
};

export default MapHoverContent;
