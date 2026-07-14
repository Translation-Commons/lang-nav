import React, { useCallback, useMemo, useState, useEffect } from 'react';

import useHoverCard from '@features/layers/hovercard/useHoverCard';
import usePagination from '@features/pagination/usePagination';
import { ObjectType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import { ColoringFunctions } from '@features/transforms/coloring/useColors';
import useScale from '@features/transforms/scales/useScale';

import DrawableData from './DrawableData';
import { getRobinsonCoordinatesShifted } from './getRobinsonCoordinates';
import { MAP_ASPECT_RATIO, MAP_INTERNAL_WIDTH, MAP_ROBINSON_X_SCALE, MAP_ROBINSON_Y_SCALE } from './MapConsts';
import { VisibleRange } from './UseMapZoom';

import './map.css';

type Props = {
  drawableEntities: DrawableData[];
  pinCard: (obj: DrawableData) => void;
  scalar: number;
  zoomFactor: number;
  visibleRange?: VisibleRange | null;
  coloringFunctions: ColoringFunctions;
  hoveredId?: string | null;
  pinnedIds?: string[];
};

function useFadeTransition<T>(
  activeItems: T[],
  keySelector: (item: T) => string,
  fadeOutMs: number,
) {
  const [renderedItems, setRenderedItems] = useState<{ item: T; isExiting: boolean }[]>([]);

  useEffect(() => {
    setRenderedItems((prev) => {
      const activeIds = new Set(activeItems.map(keySelector));
      const nextItems: { item: T; isExiting: boolean }[] = [];

      for (const item of activeItems) {
        nextItems.push({ item, isExiting: false });
      }

      for (const { item } of prev) {
        if (!activeIds.has(keySelector(item))) {
          nextItems.push({ item, isExiting: true });
        }
      }

      return nextItems;
    });
  }, [activeItems, keySelector]);

  useEffect(() => {
    const hasExiting = renderedItems.some((r) => r.isExiting);
    if (!hasExiting) return;

    const timeoutId = setTimeout(() => {
      setRenderedItems((prev) => prev.filter((r) => !r.isExiting));
    }, fadeOutMs);

    return () => clearTimeout(timeoutId);
  }, [renderedItems, fadeOutMs]);

  return renderedItems;
}

const MapCentroids: React.FC<Props> = ({
  drawableEntities,
  pinCard,
  scalar,
  zoomFactor,
  visibleRange,
  coloringFunctions: { getColor, colorBy },
  hoveredId,
  pinnedIds = [],
}) => {
  const { scaleBy, objectType } = usePageParams();
  const { getCurrentEntities } = usePagination<DrawableData>();
  const { showHoverCard, onMouseLeaveTriggeringElement } = useHoverCard();
  const { getScale } = useScale({ objects: drawableEntities, scaleBy });

  const activeEntities = useMemo(() => {
    let visibleEntities = drawableEntities;
    if (visibleRange) {
      const marginX = visibleRange.width * 0.1;
      const marginY = visibleRange.height * 0.1;
      const mapHeight = MAP_INTERNAL_WIDTH / MAP_ASPECT_RATIO;
      visibleEntities = drawableEntities.filter((obj) => {
        if (obj.latitude == null || obj.longitude == null) return false;
        const { x, y } = getRobinsonCoordinatesShifted(obj);
        const x_svg = x * MAP_ROBINSON_X_SCALE;
        const y_svg = y * -MAP_ROBINSON_Y_SCALE;
        
        const x_vr = x_svg + 180;
        const y_vr = y_svg + (mapHeight / 2);
        
        return (
          x_vr >= visibleRange.x - marginX &&
          x_vr <= visibleRange.x + visibleRange.width + marginX &&
          y_vr >= visibleRange.y - marginY &&
          y_vr <= visibleRange.y + visibleRange.height + marginY
        );
      });
    }

    const currentEntities =
      objectType === ObjectType.Language ? getCurrentEntities(visibleEntities) : visibleEntities;

    const filteredEntities = currentEntities.filter(
      (obj) => obj.type === ObjectType.Language || obj.type === ObjectType.Territory,
    );

    return filteredEntities.reverse();
  }, [drawableEntities, visibleRange, objectType, getCurrentEntities]);

  const fadingEntities = useFadeTransition(
    activeEntities,
    (obj) => obj.ID,
    300
  );

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
      {fadingEntities.map(({ item: obj, isExiting }) => (
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
          isExiting={isExiting}
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
  isExiting?: boolean;
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
  isExiting,
}) => {
  if (object.latitude == null || object.longitude == null) return null;
  const { x, y } = getRobinsonCoordinatesShifted(object);

  return (
    <g
      className={`centroid-node ${isExiting ? 'exiting' : ''}`}
      transform={`translate(${x * MAP_ROBINSON_X_SCALE}, ${y * -MAP_ROBINSON_Y_SCALE}) scale(${1 / zoomFactor})`}
    >
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
        ? 'var(--color-text)'
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

export default MapCentroids;
