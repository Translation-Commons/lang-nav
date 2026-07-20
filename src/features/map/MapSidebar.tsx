import React, { useCallback, useMemo } from 'react';

import HoverableButton from '@features/layers/hovercard/HoverableButton';
import { ObjectType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { cn } from '@shared/lib/utils';

import DrawableData from './DrawableData';
import MapCard from './MapCard';

type Props = {
  drawableEntities: DrawableData[];
  objectType: ObjectType;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
};

const MapSidebar: React.FC<Props> = ({ drawableEntities, objectType, hoveredId, setHoveredId }) => {
  const { pinned, updatePageParams } = usePageParams();

  const pinnedEntities = useMemo(() => {
    const drawableById = new Map(drawableEntities.map((entity) => [entity.ID, entity]));
    return pinned
      .map((id) => drawableById.get(id))
      .filter((entity): entity is DrawableData => entity != null);
  }, [pinned, drawableEntities]);

  const unpinCard = useCallback(
    (id: string) => {
      updatePageParams({ pinned: pinned.filter((pin) => pin !== id) });
    },
    [pinned, updatePageParams],
  );

  const [showItems, setShowItems] = React.useState(true);

  return (
    <div className={cn('MapSidebar', pinnedEntities.length > 0 ? 'w-[300px]' : 'w-0')}>
      {/* <div> */}
      <HoverableButton
        className="MapSidebarTitle"
        hoverContent="Click to toggle visibility of selected items"
        onClick={() => setShowItems((prev) => !prev)}
      >
        Selected {objectType === ObjectType.Language ? 'Languages' : 'Territories'}
      </HoverableButton>
      {/* </div> */}
      <div className={'MapSidebarContent' + (showItems ? ' growThenShow' : ' shrinkThenHide')}>
        {pinnedEntities.map((entity) => (
          <div
            key={entity.ID}
            className={'MapSidebarCard' + (hoveredId === entity.ID ? ' hovered' : '')}
            onMouseEnter={() => setHoveredId(entity.ID)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <MapCard
              drawnEntity={entity}
              objectType={objectType}
              onClose={() => {
                setHoveredId(null);
                unpinCard(entity.ID);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapSidebar;
