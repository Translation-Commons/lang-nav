import { ExternalLinkIcon } from 'lucide-react';
import React from 'react';

import HoverableButton from '@features/layers/hovercard/HoverableButton';
import { ObjectType, View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import CensusesInTerritory from '@entities/census/CensusesInTerritory';
import LocalesInTerritoryCard from '@entities/locale/LocalesInTerritoryCard';
import ObjectCard from '@entities/ui/ObjectCard';
import WritingSystemsInTerritoryCard from '@entities/writingsystem/WritingSystemsInTerritoryCard';

import DrawableData from './DrawableData';

const MapCard: React.FC<{
  drawnObject: DrawableData;
  objectType: ObjectType;
}> = ({ drawnObject, objectType }) => {
  const { updatePageParams } = usePageParams();

  const openDetails = () =>
    updatePageParams(
      objectType === ObjectType.Census || objectType === ObjectType.WritingSystem
        ? { territoryFilter: drawnObject.ID, view: View.Table }
        : { objectID: drawnObject.ID },
    );

  let content: React.ReactNode;
  if (objectType === ObjectType.Census && drawnObject.type === ObjectType.Territory)
    content = <CensusesInTerritory territory={drawnObject} />;
  else if (objectType === ObjectType.Locale && drawnObject.type === ObjectType.Territory)
    content = <LocalesInTerritoryCard territory={drawnObject} />;
  else if (objectType === ObjectType.WritingSystem && drawnObject.type === ObjectType.Territory)
    content = <WritingSystemsInTerritoryCard territory={drawnObject} />;
  else content = <ObjectCard object={drawnObject} />;

  return (
    <div
      style={{
        position: 'relative',
        maxWidth: 260,
        fontSize: '0.75em',
        background: 'var(--color-background)',
        borderRadius: '0.75em',
        boxShadow: '0 0.25em 1em rgba(0, 0, 0, 0.18)',
        padding: '1em',
      }}
    >
      <HoverableButton
        style={{
          position: 'absolute',
          top: '0.5em',
          right: '0.5em',
          padding: '0.25em',
          zIndex: 1,
        }}
        onClick={openDetails}
      >
        <ExternalLinkIcon size="1.5em" />
      </HoverableButton>

      {content}
    </div>
  );
};

export default MapCard;
