import React, { useMemo } from 'react';

import { ObjectType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import DrawableData from './DrawableData';
import MapCard from './MapCard';

type Props = {
  drawableEntities: DrawableData[];
  objectType: ObjectType;
  onClose: (id: string) => void;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
};

const MapSidebar: React.FC<Props> = ({
  drawableEntities,
  objectType,
  onClose,
  hoveredId,
  setHoveredId,
}) => {
  const { pinned } = usePageParams();

  const pinnedEntities = useMemo(() => {
    const drawableById = new Map(drawableEntities.map((entity) => [entity.ID, entity]));
    return pinned
      .map((id) => drawableById.get(id))
      .filter((entity): entity is DrawableData => entity != null);
  }, [pinned, drawableEntities]);

  if (pinnedEntities.length === 0) return null;

  return (
    <div
      style={{
        width: '300px',
        height: '100%',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1em',
        padding: '1em',
        background: 'var(--color-background)',
      }}
    >
      <h3 style={{ margin: '0 0 0.5em 0' }}>
        Selected {objectType === ObjectType.Language ? 'Languages' : 'Territories'}
      </h3>
      {pinnedEntities.map((entity) => (
        <div
          key={entity.ID}
          onMouseEnter={() => setHoveredId(entity.ID)}
          onMouseLeave={() => setHoveredId(null)}
          style={{
            transition: 'transform 0.15s ease-in-out',
            transform: hoveredId === entity.ID ? 'scale(1.02)' : 'scale(1)',
          }}
        >
          <MapCard
            drawnEntity={entity}
            objectType={objectType}
            onClose={() => {
              setHoveredId(null);
              onClose(entity.ID);
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default MapSidebar;
