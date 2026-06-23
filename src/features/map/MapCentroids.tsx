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
import { getRobinsonCoordinatesShifted } from './getRobinsonCoordinates';
import { MAP_ASPECT_RATIO, MAP_ROBINSON_X_SCALE, MAP_ROBINSON_Y_SCALE } from './MapConsts';

import './map.css';

type Props = {
  drawableEntities: DrawableData[];
  pinCard: (obj: DrawableData) => void;
  scalar: number;
  zoomFactor: number;
  coloringFunctions: ColoringFunctions;
  hoveredId?: string | null;
  pinnedIds?: string[];
};

const MapCentroids: React.FC<Props> = ({
  drawableEntities,
  pinCard,
  scalar,
  zoomFactor,
  coloringFunctions: { getColor, colorBy },
  hoveredId,
  pinnedIds = [],
}) => {
  const { scaleBy, objectType } = usePageParams();
  const { getCurrentEntities } = usePagination<DrawableData>();
  const { showHoverCard, onMouseLeaveTriggeringElement } = useHoverCard();
  const { getScale } = useScale({ objects: drawableEntities, scaleBy });

  const renderableEntities = useMemo(() => {
    const currentEntities =
      objectType === ObjectType.Language ? getCurrentEntities(drawableEntities) : drawableEntities;

    const filteredEntities = currentEntities.filter(
      (obj) => obj.type === ObjectType.Language || obj.type === ObjectType.Territory,
    );

    return filteredEntities.reverse();
  }, [drawableEntities, getCurrentEntities, objectType]);

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
      {renderableEntities.map((obj) => (
        <ObjectNode
          key={obj.ID}
          color={colorBy === 'None' ? undefined : (getColor(obj) ?? 'transparent')}
          object={obj}
          scale={scalar * getScale(obj)}
          zoomFactor={zoomFactor}
          pinCard={pinCard}
          onMouseEnter={buildOnMouseEnter(obj)}
          onMouseLeave={onMouseLeaveTriggeringElement}
          isHovered={hoveredId === obj.ID}
          isPinned={pinnedIds.includes(obj.ID)}
        />
      ))}
    </svg>
  );
};

type NodeProps = {
  color?: string;
  object: DrawableData;
  scale: number;
  zoomFactor: number;
  pinCard: (obj: DrawableData) => void;
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  isHovered?: boolean;
  isPinned?: boolean;
};

const ObjectNode: React.FC<NodeProps> = ({
  object,
  color,
  scale,
  zoomFactor,
  pinCard,
  onMouseEnter,
  onMouseLeave,
  isHovered,
  isPinned,
}) => {
  if (object.type !== ObjectType.Language && object.type !== ObjectType.Territory) return null;
  if (object.latitude == null || object.longitude == null) return null;

  const { x, y } = getRobinsonCoordinatesShifted(object);

  const showCircle = !(object.type === ObjectType.Territory && (object?.landArea || 0) >= 20000);

  return (
    <g
      transform={`translate(${x * MAP_ROBINSON_X_SCALE}, ${y * -MAP_ROBINSON_Y_SCALE}) scale(${1 / zoomFactor})`}
    >
      {showCircle && (
        <Circle
          color={color}
          object={object}
          scale={scale}
          zoomFactor={zoomFactor}
          pinCard={pinCard}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          isHovered={isHovered}
          isPinned={isPinned}
        />
      )}
      <Text object={object} scale={scale} showCircle={showCircle} zoomFactor={zoomFactor} />
    </g>
  );
};

const Circle: React.FC<NodeProps> = ({
  color,
  object,
  scale,
  pinCard,
  onMouseEnter,
  onMouseLeave,
  isHovered,
  isPinned,
}) => (
  <circle
    r={scale + 1.5 + (isHovered ? 2 : 0) + (isPinned ? 0.8 : 0)}
    strokeWidth={isPinned ? 2 : isHovered ? 1.5 : 0.4}
    fill={color ?? 'transparent'}
    stroke={
      isPinned
        ? 'black'
        : isHovered
          ? 'var(--color-button-primary)'
          : color == null
            ? 'var(--color-button-primary)'
            : 'transparent'
    }
    style={
      isHovered
        ? { filter: 'brightness(1.2)', transition: 'all 0.15s ease-in-out' }
        : { transition: 'all 0.15s ease-in-out' }
    }
    onClick={(e) => {
      e.stopPropagation();
      pinCard(object);
    }}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  />
);

type TextProps = {
  object: DrawableData;
  scale: number;
  showCircle: boolean;
  zoomFactor: number;
};

const Text: React.FC<TextProps> = ({ object, scale, showCircle, zoomFactor }) => {
  const { fieldFocus } = usePageParams();

  if (fieldFocus === Field.None) return null;
  if (zoomFactor < 1.5) return null;

  return (
    <text
      y={showCircle ? scale + 2.5 : 0}
      fontSize={scale / 3 + 'em'}
      textAnchor="middle"
      alignmentBaseline={showCircle ? 'hanging' : 'middle'}
    >
      {getFieldString(object, fieldFocus)}
    </text>
  );
};

export default MapCentroids;
