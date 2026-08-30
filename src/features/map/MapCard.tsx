import { PinIcon, PinOffIcon, SquareArrowUpRightIcon } from 'lucide-react';
import React from 'react';

import ZIndex from '@features/layers/ZIndex';
import { EntityType, View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import CensusesInTerritory from '@entities/census/CensusesInTerritory';
import LocalesInTerritoryCard from '@entities/locale/LocalesInTerritoryCard';
import EntityCard from '@entities/ui/EntityCard';
import WritingSystemsInTerritoryCard from '@entities/writingsystem/WritingSystemsInTerritoryCard';

import { Button } from '@shared/ui/button';

import DrawableData from './DrawableData';

const MapCard: React.FC<{
  drawnEntity: DrawableData;
  entType: EntityType;
  onClose: () => void;
}> = ({ drawnEntity, entType, onClose }) => {
  const { updatePageParams } = usePageParams();

  const openDetails = () =>
    updatePageParams(
      entType === EntityType.Census || entType === EntityType.WritingSystem
        ? { territoryFilter: drawnEntity.ID, view: View.Table }
        : { entID: drawnEntity.ID },
    );

  let content: React.ReactNode = <EntityCard ent={drawnEntity} />;
  if (drawnEntity.type === EntityType.Territory) {
    switch (entType) {
      case EntityType.Census:
        content = <CensusesInTerritory territory={drawnEntity} />;
        break;
      case EntityType.Locale:
        content = <LocalesInTerritoryCard territory={drawnEntity} />;
        break;
      case EntityType.WritingSystem:
        content = <WritingSystemsInTerritoryCard territory={drawnEntity} />;
        break;
    }
  }

  return (
    <div
      className="relative max-w-[300px] text-xs bg-background rounded-lg text-left p-4"
      style={{ boxShadow: '0 0.25em 1em rgba(0, 0, 0, 0.18)' }}
    >
      <div
        className="absolute top-0 right-[0.5em] flex gap-1 text-xs translate-y-[-50%]"
        style={{ zIndex: ZIndex.MapZoomControls }}
      >
        <Button className="cursor-pointer h-8 w-8" onClick={openDetails} variant="secondary">
          <SquareArrowUpRightIcon />
        </Button>
        {/* Similar to PinButton but matching local styling */}
        <Button className="cursor-pointer h-8 w-8" variant="secondary" onClick={onClose}>
          <PinIcon className="fill-foreground group-hover/button:hidden" />
          <PinOffIcon className="fill-foreground hidden group-hover/button:inline-block" />
        </Button>
      </div>

      {content}
    </div>
  );
};

export default MapCard;
