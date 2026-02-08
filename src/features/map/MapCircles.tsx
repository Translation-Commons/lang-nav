import React, { useCallback, useMemo, useState } from 'react';

import useHoverCard from '@features/layers/hovercard/useHoverCard';
import usePagination from '@features/pagination/usePagination';
import { ObjectType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import { ColoringFunctions } from '@features/transforms/coloring/useColors';
import useScale from '@features/transforms/scales/useScale';

import DrawableData from './DrawableData';
import { getRobinsonCoordinates } from './getRobinsonCoordinates';

type Props = {
  drawableObjects: DrawableData[];
  getHoverContent: (obj: DrawableData) => React.ReactNode;
  scalar: number;
  coloringFunctions: ColoringFunctions;
};

const MapCircles: React.FC<Props> = ({
  drawableObjects,
  getHoverContent,
  scalar,
  coloringFunctions: { getColor, colorBy },
}) => {
  const { scaleBy, objectType } = usePageParams();
  const { getCurrentObjects } = usePagination<DrawableData>();
  const { showHoverCard, onMouseLeaveTriggeringElement } = useHoverCard();
  const { getScale } = useScale({ objects: drawableObjects, scaleBy });

  const renderableObjects = useMemo(() => {
    // Pagination only applies for languages because there can be thousands, other types have few enough
    const currentObjects =
      objectType === ObjectType.Language ? getCurrentObjects(drawableObjects) : drawableObjects;
    const filteredObjects = currentObjects.filter(
      (obj) =>
        obj.type === ObjectType.Language ||
        (obj.type === ObjectType.Territory && (obj.landArea ?? 0) < 20000),
    );

    // Reverse so the "first" objects are drawn on top.
    return filteredObjects.reverse();
  }, [drawableObjects, getCurrentObjects]);

  const buildOnMouseEnter = useCallback(
    (obj: DrawableData) => (e: React.MouseEvent) => {
      showHoverCard(getHoverContent(obj), e.clientX, e.clientY);
    },
    [showHoverCard, getHoverContent],
  );

  return (
    <svg
      viewBox={`-180 -90 360 180`}
      preserveAspectRatio="xMidYMid meet"
      style={{
        //border: '1px solid #ccc',
        display: 'block',
        top: 0,
        left: 0,
        position: 'absolute',
        width: '100%',
        aspectRatio: 1.979, // Aspect ratio of the map_world.svg
        pointerEvents: 'none', // So that the svg doesn't block mouse events to the underlying map
      }}
    >
      {renderableObjects.map((obj) => (
        <HoverableCircle
          key={obj.ID}
          color={colorBy === 'None' ? undefined : (getColor(obj) ?? 'transparent')}
          object={obj}
          scale={scalar * getScale(obj)}
          onMouseEnter={buildOnMouseEnter(obj)}
          onMouseLeave={onMouseLeaveTriggeringElement}
        />
      ))}
    </svg>
  );
};

const HoverableCircle: React.FC<{
  color?: string;
  object: DrawableData;
  scale: number;
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
}> = ({ object, color, scale, onMouseEnter, onMouseLeave }) => {
  const { updatePageParams } = usePageParams();
  const [isActive, setIsActive] = useState(false);
  if (object.type !== ObjectType.Language && object.type !== ObjectType.Territory) return null;
  if (object.latitude == null || object.longitude == null) {
    return null;
  }

  const { x, y } = getRobinsonCoordinates(
    object.latitude,
    // The map is 12 degrees rotated to preserve land borders
    (object.longitude < -168 ? object.longitude + 360 : object.longitude) - 12,
  );

  return (
    <circle
      cx={x * 180}
      cy={-y * 90}
      r={scale * 2}
      fill={color ?? (isActive ? 'var(--color-button-primary)' : 'transparent')}
      stroke={color == null ? 'var(--color-button-primary)' : 'transparent'}
      style={{ transition: 'fill 0.25s, stroke 0.25s', pointerEvents: 'fill', cursor: 'pointer' }}
      className="object-map-circle"
      strokeWidth={scale}
      onClick={() => updatePageParams({ objectID: object.ID })}
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
