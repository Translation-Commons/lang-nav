import React, { useCallback, useMemo } from 'react';

import useHoverCard from '@features/layers/hovercard/useHoverCard';
import usePagination from '@features/pagination/usePagination';
import { EntityType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import { ColoringFunctions } from '@features/transforms/coloring/useColors';
import Field from '@features/transforms/fields/Field';
import { getFieldString } from '@features/transforms/fields/getFieldString';
import useScale from '@features/transforms/scales/useScale';

import DrawableData from './DrawableData';
import { getRobinsonCoordinatesShifted } from './getRobinsonCoordinates';
import { MAP_ROBINSON_X_SCALE, MAP_ROBINSON_Y_SCALE } from './MapConsts';

import './map.css';

type Props = {
  drawableEntities: DrawableData[];
  onClick: (ent: DrawableData) => void;
  scalar: number;
  zoomFactor: number;
  coloringFunctions: ColoringFunctions;
  hoveredId?: string | null;
  pinnedIds?: string[];
  allowSidebar?: boolean;
};

const MapCentroids: React.FC<Props> = ({
  drawableEntities,
  onClick,
  scalar,
  zoomFactor,
  coloringFunctions: { getColor, colorBy },
  hoveredId,
  pinnedIds = [],
  allowSidebar,
}) => {
  const { scaleBy, entityType } = usePageParams();
  const { getCurrentEntities } = usePagination<DrawableData>();
  const { showHoverCard, onMouseLeaveTriggeringElement } = useHoverCard();
  const { getScale } = useScale({ ents: drawableEntities, scaleBy });

  const renderableEntities = useMemo(() => {
    const currentEntities =
      entityType === EntityType.Language ? getCurrentEntities(drawableEntities) : drawableEntities;

    const filteredEntities = currentEntities.filter(
      (ent) => ent.type === EntityType.Language || ent.type === EntityType.Territory,
    );

    return filteredEntities.reverse();
  }, [drawableEntities, getCurrentEntities, entityType]);

  const buildOnMouseEnter = useCallback(
    (ent: DrawableData) => (e: React.MouseEvent) => {
      showHoverCard(
        <div>
          <strong>{ent.nameDisplay}</strong>
          <div style={{ color: 'var(--color-text-secondary)' }}>
            {allowSidebar ? 'Pin to sidebar' : 'Open in details panel'}
          </div>
        </div>,
        e.clientX,
        e.clientY,
      );
    },
    [showHoverCard, allowSidebar],
  );

  return (
    <svg
      className="MapLayer"
      viewBox="-180 -90 360 180"
      preserveAspectRatio="xMidYMid meet"
      style={{ pointerEvents: 'none' }}
    >
      {renderableEntities.map((ent) => (
        <ObjectNode
          key={ent.ID}
          color={colorBy === 'None' ? undefined : (getColor(ent) ?? 'transparent')}
          ent={ent}
          scale={scalar * getScale(ent)}
          zoomFactor={zoomFactor}
          onClick={onClick}
          onMouseEnter={buildOnMouseEnter(ent)}
          onMouseLeave={onMouseLeaveTriggeringElement}
          isHovered={hoveredId === ent.ID}
          isPinned={pinnedIds.includes(ent.ID)}
        />
      ))}
    </svg>
  );
};

type NodeProps = {
  color?: string;
  ent: DrawableData;
  scale: number;
  zoomFactor: number;
  onClick: (ent: DrawableData) => void;
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  isHovered?: boolean;
  isPinned?: boolean;
};

const ObjectNode: React.FC<NodeProps> = ({
  ent,
  color,
  scale,
  zoomFactor,
  onClick,
  onMouseEnter,
  onMouseLeave,
  isHovered,
  isPinned,
}) => {
  if (ent.type !== EntityType.Language && ent.type !== EntityType.Territory) return null;
  if (ent.latitude == null || ent.longitude == null) return null;

  const { x, y } = getRobinsonCoordinatesShifted(ent);

  const showCircle = !(ent.type === EntityType.Territory && (ent?.landArea || 0) >= 20000);

  return (
    <g
      transform={`translate(${x * MAP_ROBINSON_X_SCALE}, ${y * -MAP_ROBINSON_Y_SCALE}) scale(${1 / zoomFactor})`}
    >
      {showCircle && (
        <Circle
          color={color}
          ent={ent}
          scale={scale}
          zoomFactor={zoomFactor}
          onClick={onClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          isHovered={isHovered}
          isPinned={isPinned}
        />
      )}
      <Text ent={ent} scale={scale} showCircle={showCircle} zoomFactor={zoomFactor} />
    </g>
  );
};

const Circle: React.FC<NodeProps> = ({
  color,
  ent,
  scale,
  onClick,
  onMouseEnter,
  onMouseLeave,
  isHovered,
  isPinned,
}) => (
  <circle
    className={'MapCentroidCircle' + (isHovered ? ' hovered' : '') + (isPinned ? ' pinned' : '')}
    r={scale + 1.5}
    fill={color ?? 'transparent'}
    stroke={color == null ? 'var(--color-button-primary)' : 'transparent'}
    onClick={(e) => {
      e.stopPropagation();
      onClick(ent);
    }}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  />
);

type TextProps = {
  ent: DrawableData;
  scale: number;
  showCircle: boolean;
  zoomFactor: number;
};

const Text: React.FC<TextProps> = ({ ent, scale, showCircle, zoomFactor }) => {
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
      {getFieldString(ent, fieldFocus)}
    </text>
  );
};

export default MapCentroids;
