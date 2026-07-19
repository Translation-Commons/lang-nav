import { PinOffIcon, SquareArrowUpRightIcon } from 'lucide-react';
import React from 'react';

import HoverableIcon from '@features/layers/hovercard/HoverableIcon';
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

  let content: React.ReactNode = <ObjectCard object={drawnEntity} />;
  let clickDescription = 'Open in details panel';
  if (drawnEntity.type === ObjectType.Territory) {
    switch (objectType) {
      case ObjectType.Census:
        content = <CensusesInTerritory territory={drawnEntity} />;
        clickDescription = 'Open table of censuses in this territory';
        break;
      case ObjectType.Locale:
        content = <LocalesInTerritoryCard territory={drawnEntity} />;
        clickDescription = 'Open table of locales in this territory';
        break;
      case ObjectType.WritingSystem:
        content = <WritingSystemsInTerritoryCard territory={drawnEntity} />;
        clickDescription = 'Open table of writing systems in this territory';
        break;
    }
  }

  return (
    <div
      style={{
        position: 'relative',
        maxWidth: 300,
        fontSize: '0.75em',
        background: 'var(--color-background)',
        borderRadius: '0.75em',
        boxShadow: '0 0.25em 1em rgba(0, 0, 0, 0.18)',
        padding: '1em',
        textAlign: 'left',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '0',
          right: '0.5em',
          transform: 'translateY(-50%)',
          display: 'flex',
          gap: '0.5em',
          zIndex: 5, // map zoom controls above map layers
          fontSize: '.8em',
        }}
      >
        <HoverableIcon
          Icon={SquareArrowUpRightIcon}
          onClick={openDetails}
          description={clickDescription}
        />
        <HoverableIcon Icon={PinOffIcon} onClick={onClose} description="Unpin" />
      </div>

      {content}
    </div>
  );
};

export default MapCard;
