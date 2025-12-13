import React, { useCallback, useMemo, useState } from 'react';

import useHoverCard from '@features/layers/hovercard/useHoverCard';
import usePagination from '@features/pagination/usePagination';
import { ObjectType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import useColors from '@features/transforms/coloring/useColors';
import useScale from '@features/transforms/scales/useScale';

import { ObjectData } from '@entities/types/DataTypes';
import ObjectCard from '@entities/ui/ObjectCard';

import { getRobinsonCoordinates } from './getRobinsonCoordinates';

type Props = {
  objects: ObjectData[];
  scalar: number;
};

const MapCircles: React.FC<Props> = ({ objects, scalar }) => {
  const { colorBy, scaleBy } = usePageParams();
  const { getCurrentObjects } = usePagination<ObjectData>();
  const { showHoverCard, onMouseLeaveTriggeringElement } = useHoverCard();
  const coloringFunctions = useColors({ objects });
  const scalingFunctions = useScale({ objects, scaleBy });

  const renderableObjects = useMemo(
    // Reverse so the "first" objects are drawn on top.
    () => getCurrentObjects(objects).reverse(),
    [objects, getCurrentObjects],
  );

  const buildOnMouseEnter = useCallback(
    (obj: ObjectData) => (e: React.MouseEvent) => {
      showHoverCard(<ObjectCard object={obj} />, e.clientX, e.clientY);
    },
    [showHoverCard],
  );

  return (
    <svg
      viewBox={`-180 -90 360 180`}
      preserveAspectRatio="xMidYMid meet"
      style={{
        border: '1px solid #ccc',
        display: 'block',
        top: 0,
        left: 0,
        position: 'absolute',
        width: '100%',
        aspectRatio: 1.979, // Aspect ratio of the map_world.svg
      }}
    >
      {renderableObjects.map((obj) => {
        return (
          <HoverableCircle
            key={obj.ID}
            color={
              colorBy === 'None' ? undefined : (coloringFunctions.getColor(obj) ?? 'transparent')
            }
            object={obj}
            scalar={scalar}
            getScale={scalingFunctions.getScale}
            onMouseEnter={buildOnMouseEnter(obj)}
            onMouseLeave={onMouseLeaveTriggeringElement}
          />
        );
      })}
    </svg>
  );
};

const HoverableCircle: React.FC<{
  color?: string;
  object: ObjectData;
  scalar: number;
  getScale?: (object: ObjectData) => number;
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
}> = ({ object, color, scalar, getScale, onMouseEnter, onMouseLeave }) => {
  if (object.type !== ObjectType.Language && object.type !== ObjectType.Territory) return null;
  if (object.latitude == null || object.longitude == null) {
    return null;
  }

  const { x, y } = getRobinsonCoordinates(
    object.latitude,
    // The map is 12 degrees rotated to preserve land borders
    (object.longitude < -168 ? object.longitude + 360 : object.longitude) - 12,
  );
  const [isActive, setIsActive] = useState(false);
  const computedRadiusMultiplier = getScale ? getScale(object) : 2;
  if (computedRadiusMultiplier <= 0) return null;

  return (
    <circle
      cx={x * 180}
      cy={-y * 90}
      r={computedRadiusMultiplier * scalar}
      fill={color ?? (isActive ? 'var(--color-button-primary)' : 'transparent')}
      stroke={color == null ? 'var(--color-button-primary)' : 'transparent'}
      style={{ transition: 'fill 0.25s, stroke 0.25s' }}
      className="object-map-circle"
      strokeWidth={1 * scalar}
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

export default MapCircles;
