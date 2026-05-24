import React, { useCallback, useMemo } from 'react';

import useHoverCard from '@features/layers/hovercard/useHoverCard';
import usePagination from '@features/pagination/usePagination';
import { ObjectType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import { ColoringFunctions } from '@features/transforms/coloring/useColors';
import Field from '@features/transforms/fields/Field';
import { getFieldString } from '@features/transforms/fields/getFieldString';
import useScale from '@features/transforms/scales/useScale';

import DrawableData from './DrawableData';
import { getRobinsonCoordinates } from './getRobinsonCoordinates';
import { MAP_ASPECT_RATIO } from './MapConsts';

import './map.css';

type Props = {
  drawableObjects: DrawableData[];
  openCard: (obj: DrawableData, x: number, y: number) => void;
  scalar: number;
  coloringFunctions: ColoringFunctions;
};

const MapCentroids: React.FC<Props> = ({
  drawableObjects,
  openCard,
  scalar,
  coloringFunctions: { getColor, colorBy },
}) => {
  const { scaleBy, objectType } = usePageParams();
  const { getCurrentObjects } = usePagination<DrawableData>();
  const { showHoverCard, onMouseLeaveTriggeringElement } = useHoverCard();
  const { getScale } = useScale({ objects: drawableObjects, scaleBy });

  const renderableObjects = useMemo(() => {
    const currentObjects =
      objectType === ObjectType.Language ? getCurrentObjects(drawableObjects) : drawableObjects;

    const filteredObjects = currentObjects.filter(
      (obj) => obj.type === ObjectType.Language || obj.type === ObjectType.Territory,
    );

    return filteredObjects.reverse();
  }, [drawableObjects, getCurrentObjects, objectType]);

  const buildOnMouseEnter = useCallback(
    (obj: DrawableData) => (e: React.MouseEvent) => {
      showHoverCard(
        <div>
          <strong>{obj.nameDisplay}</strong>
          <div style={{ color: 'var(--color-text-secondary)' }}>Click for more</div>
        </div>,
        e.clientX,
        e.clientY,
      );
    },
    [showHoverCard],
  );

  return (
    <svg
      viewBox="-180 -90 360 180"
      preserveAspectRatio="xMidYMid meet"
      style={{
        display: 'block',
        top: 0,
        left: 0,
        position: 'absolute',
        width: '100%',
        aspectRatio: MAP_ASPECT_RATIO,
        pointerEvents: 'none',
      }}
    >
      {renderableObjects.map((obj) => (
        <ObjectNode
          key={obj.ID}
          color={colorBy === 'None' ? undefined : (getColor(obj) ?? 'transparent')}
          object={obj}
          scale={scalar * getScale(obj)}
          openCard={openCard}
          onMouseEnter={buildOnMouseEnter(obj)}
          onMouseLeave={onMouseLeaveTriggeringElement}
        />
      ))}
    </svg>
  );
};

type NodeProps = {
  color?: string;
  object: DrawableData;
  scale: number;
  openCard: (obj: DrawableData, x: number, y: number) => void;
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
};

const ObjectNode: React.FC<NodeProps> = ({
  object,
  color,
  scale,
  openCard,
  onMouseEnter,
  onMouseLeave,
}) => {
  if (object.type !== ObjectType.Language && object.type !== ObjectType.Territory) return null;
  if (object.latitude == null || object.longitude == null) return null;

  const { x, y } = getRobinsonCoordinates(
    object.latitude,
    (object.longitude < -169 ? object.longitude + 360 : object.longitude) - 11,
  );

  const showCircle = !(object.type === ObjectType.Territory && (object?.landArea || 0) >= 20000);

  return (
    <g transform={`translate(${x * 178.5}, ${y * -90})`}>
      {showCircle && (
        <Circle
          color={color}
          object={object}
          scale={scale}
          openCard={openCard}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        />
      )}
      <Text object={object} scale={scale} showCircle={showCircle} />
    </g>
  );
};

const Circle: React.FC<NodeProps> = ({
  color,
  object,
  scale,
  openCard,
  onMouseEnter,
  onMouseLeave,
}) => (
  <circle
    r={scale + 1}
    fill={color ?? 'transparent'}
    stroke={color == null ? 'var(--color-button-primary)' : 'transparent'}
    onClick={(e) => {
      e.stopPropagation();
      openCard(object, e.clientX, e.clientY);
    }}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  />
);

type TextProps = {
  object: DrawableData;
  scale: number;
  showCircle: boolean;
};

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
      {getFieldString(object, fieldFocus)}
    </text>
  );
};

export default MapCentroids;
