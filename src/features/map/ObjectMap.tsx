import React, { useCallback, useMemo, useState } from 'react';

import { getSliceFunction } from '@features/filtering/filter';
import useHoverCard from '@features/hovercard/useHoverCard';
import { ObjectType } from '@features/page-params/PageParamTypes';

import { ObjectData } from '@entities/types/DataTypes';
import ObjectCard from '@entities/ui/ObjectCard';

import { getRobinsonCoordinates } from './getRobinsonCoordinates';

type Props = {
  objects: ObjectData[];
  maxWidth?: number; // in pixels
  borders?: 'no_borders' | 'countries' | 'subdivisions';
};

const ROBINSON_MAPS = {
  no_borders: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/WorldMap.svg',
  countries:
    'https://upload.wikimedia.org/wikipedia/commons/5/5e/BlankMap-World-Sovereign_Nations.svg',
  subdivisions:
    'https://upload.wikimedia.org/wikipedia/commons/d/d9/Blank_Map_World_Secondary_Political_Divisions.svg',
};

const ObjectMap: React.FC<Props> = ({ objects, maxWidth = 800, borders = 'no_borders' }) => {
  const sliceFunction = getSliceFunction<ObjectData>();
  const renderableObjects = useMemo(() => {
    return sliceFunction(objects.filter((obj) => obj.type === ObjectType.Language));
  }, [objects, sliceFunction]);
  const { showHoverCard, onMouseLeaveTriggeringElement } = useHoverCard();

  const buildOnMouseEnter = useCallback(
    (obj: ObjectData) => (e: React.MouseEvent) => {
      showHoverCard(<ObjectCard object={obj} />, e.clientX, e.clientY);
    },
    [showHoverCard],
  );

  return (
    <div style={{ maxWidth, width: '100%' }}>
      <svg
        width="100%"
        viewBox={`-180 -90 360 180`}
        preserveAspectRatio="xMidYMid meet"
        style={{
          border: '1px solid #ccc',
          backgroundColor: 'var(--color-background)',
          display: 'block',
        }}
      >
        {/* External equirectangular SVG background (world map) */}
        <image
          href={ROBINSON_MAPS[borders]}
          x={-180}
          y={-90}
          width={360}
          height={180}
          preserveAspectRatio="none"
          opacity={1}
          pointerEvents="none"
        />

        {renderableObjects.map((obj, idx) => {
          if (obj.type === ObjectType.Language) {
            return (
              <HoverableCircle
                object={obj}
                key={idx}
                onMouseEnter={buildOnMouseEnter(obj)}
                onMouseLeave={onMouseLeaveTriggeringElement}
              />
            );
          }
        })}
      </svg>
    </div>
  );
};

const HoverableCircle: React.FC<{
  object: ObjectData;
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
}> = ({ object, onMouseEnter, onMouseLeave }) => {
  if (object.type !== ObjectType.Language) return null;
  if (object.latitude == null || object.longitude == null) {
    return null;
  }

  const { x, y } = getRobinsonCoordinates(
    object.latitude,
    object.longitude < -170 ? object.longitude + 360 : object.longitude,
  );
  const [isActive, setIsActive] = useState(false);
  return (
    <circle
      cx={x * 180 - 10} // The map is 10 degrees rotated to perserve land borders
      cy={-y * 90}
      r={2}
      fill={isActive ? 'var(--color-button-primary)' : 'transparent'}
      stroke="var(--color-button-primary)"
      strokeWidth={1}
      onMouseEnter={(e: React.MouseEvent) => {
        onMouseEnter(e);
        setIsActive(true);
      }}
      onMouseLeave={() => {
        onMouseLeave();
        setIsActive(false);
      }}
    />
  );
};

export default ObjectMap;
