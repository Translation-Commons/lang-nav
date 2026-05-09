import React, { useCallback, useMemo } from 'react';

import useHoverCard from '@features/layers/hovercard/useHoverCard';
import usePagination from '@features/pagination/usePagination';
import { ObjectType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import { ColoringFunctions } from '@features/transforms/coloring/useColors';
import Field from '@features/transforms/fields/Field';
import ObjectFieldDisplay from '@features/transforms/fields/ObjectFieldDisplay';
import useScale from '@features/transforms/scales/useScale';

import DrawableData from './DrawableData';
import { getRobinsonCoordinates } from './getRobinsonCoordinates';
import { MAP_ASPECT_RATIO } from './MapConsts';

import './map.css';

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
      (obj) => obj.type === ObjectType.Language || obj.type === ObjectType.Territory,
    );

    // Reverse so the "first" objects are drawn on top.
    return filteredObjects.reverse();
  }, [drawableObjects, getCurrentObjects, objectType]);

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
        display: 'block',
        top: 0,
        left: 0,
        position: 'absolute',
        width: '100%',
        aspectRatio: MAP_ASPECT_RATIO, // Aspect ratio of the map_world.svg
        pointerEvents: 'none', // So that the svg doesn't block mouse events to the underlying map
      }}
    >
      {renderableObjects.map((obj) => (
        <ObjectPoint
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

type PointProps = {
  color?: string;
  object: DrawableData;
  scale: number;
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
};
const ObjectPoint: React.FC<PointProps> = ({
  object,
  color,
  scale,
  onMouseEnter,
  onMouseLeave,
}) => {
  if (object.type !== ObjectType.Language && object.type !== ObjectType.Territory) return null;
  if (object.latitude == null || object.longitude == null) return null;

  const { x, y } = getRobinsonCoordinates(
    object.latitude,
    // The map is 11 degrees rotated to preserve land borders
    (object.longitude < -169 ? object.longitude + 360 : object.longitude) - 11,
  );
  const showCircle = !(object.type === ObjectType.Territory && (object?.landArea || 0) >= 20000);

  return (
    // ideally x would range -180 to 180 but it appears in practice our SVG is a bit thinner, so 178.5 looks better
    <g style={{ transform: `translate(${x * 178.5}px, ${y * -90}px)` }}>
      {showCircle && (
        <Circle
          color={color}
          object={object}
          scale={scale}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        />
      )}
      <Text object={object} scale={scale} showCircle={showCircle} />
    </g>
  );
};

const Circle: React.FC<PointProps> = ({ color, object, scale, onMouseEnter, onMouseLeave }) => {
  const { updatePageParams } = usePageParams();
  return (
    <circle
      r={scale + 1}
      fill={color ?? 'transparent'}
      stroke={color == null ? 'var(--color-button-primary)' : 'transparent'}
      onClick={() => updatePageParams({ objectID: object.ID })}
      onMouseEnter={(e: React.MouseEvent) => onMouseEnter(e)}
      onMouseLeave={() => onMouseLeave()}
    />
  );
};

type TextProps = { object: DrawableData; scale: number; showCircle: boolean };
const Text: React.FC<TextProps> = ({ object, scale, showCircle }) => {
  const { fieldFocus } = usePageParams();
  if (fieldFocus === Field.None) return null;
  return (
    <text
      y={showCircle ? 2 : 0}
      fontSize={scale / 4 + 'em'}
      textAnchor="middle"
      alignmentBaseline={showCircle ? 'hanging' : 'middle'}
    >
      {/* Some of these may not render if they are React components and not primitives */}
      <ObjectFieldDisplay object={object} field={fieldFocus} />
    </text>
  );
};

export default MapCircles;
