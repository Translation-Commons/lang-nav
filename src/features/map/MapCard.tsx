import { ExternalLinkIcon, X } from 'lucide-react';
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
  drawnEntity: DrawableData;
  objectType: ObjectType;
  onClose: () => void;
}> = ({ drawnEntity, objectType, onClose }) => {
  const { updatePageParams } = usePageParams();

  const openDetails = () =>
    updatePageParams(
      objectType === ObjectType.Census || objectType === ObjectType.WritingSystem
        ? { territoryFilter: drawnEntity.ID, view: View.Table }
        : { objectID: drawnEntity.ID },
    );

  let content: React.ReactNode;
  if (objectType === ObjectType.Census && drawnEntity.type === ObjectType.Territory)
    content = <CensusesInTerritory territory={drawnEntity} />;
  else if (objectType === ObjectType.Locale && drawnEntity.type === ObjectType.Territory)
    content = <LocalesInTerritoryCard territory={drawnEntity} />;
  else if (objectType === ObjectType.WritingSystem && drawnEntity.type === ObjectType.Territory)
    content = <WritingSystemsInTerritoryCard territory={drawnEntity} />;
  else content = <ObjectCard object={drawnEntity} />;

  return (
    <div
      style={{
        position: 'relative',
        maxWidth: 260,
        fontSize: '0.75em',
        background: 'var(--color-background)',
        borderRadius: '0.75em',
        boxShadow: '0 0.25em 1em rgba(0, 0, 0, 0.18)',
        padding: '3.25em 1em 1em',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '0.5em',
          right: '0.5em',
          display: 'flex',
          gap: '0.25em',
          zIndex: 1,
        }}
      >
        <HoverableButton onClick={openDetails}>
          <ExternalLinkIcon size="1.25em" />
        </HoverableButton>

        <HoverableButton onClick={onClose}>
          <X size="1.25em" />
        </HoverableButton>
      </div>

      {content}
    </div>
  );
};

export default MapCard;
