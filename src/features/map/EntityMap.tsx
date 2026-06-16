import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ObjectType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import ColorBar from '@features/transforms/coloring/ColorBar';
import useColors from '@features/transforms/coloring/useColors';
import Field from '@features/transforms/fields/Field';

import { LanguageData } from '@entities/language/LanguageTypes';
import { getObjectLocales } from '@entities/lib/getObjectRelatedTerritories';
import { TerritoryData } from '@entities/territory/TerritoryTypes';
import { ObjectData } from '@entities/types/DataTypes';

import { uniqueBy } from '@shared/lib/setUtils';

import DrawableData from './DrawableData';
import { getRobinsonCoordinatesShifted } from './getRobinsonCoordinates';
import MapCard from './MapCard';
import MapCentroids from './MapCentroids';
import {
  MAP_ASPECT_RATIO,
  MAP_INTERNAL_WIDTH,
  MAP_ROBINSON_X_SCALE,
  MAP_ROBINSON_Y_SCALE,
} from './MapConsts';
import MapTerritories from './MapTerritories';
import useMapZoom from './UseMapZoom';
import ZoomControls from './ZoomControls';

type Props = {
  entities: ObjectData[];
  maxWidth?: number;
};

type FloatingCard = {
  id: string;
  entity: DrawableData;
  x: number;
  y: number;
};

const ObjectMap: React.FC<Props> = ({ entities, maxWidth = 2000 }) => {
  const mapHeight = MAP_INTERNAL_WIDTH / MAP_ASPECT_RATIO;

  const [zoomFactor, setZoomFactor] = useState(1);

  const { containerRef, contentRef, zoomIn, zoomOut, resetTransform } = useMapZoom({
    mapWidth: MAP_INTERNAL_WIDTH,
    mapHeight,
    onZoom: setZoomFactor,
  });

  const { colorBy, objectType, pinned, updatePageParams } = usePageParams();
  const [mapScale, setMapScale] = useState(1);
  const prevObjectTypeRef = useRef(objectType);

  const updateMapScale = useCallback(() => {
    const rect = contentRef.current?.getBoundingClientRect();
    if (!rect) return;

    setMapScale(rect.width / MAP_INTERNAL_WIDTH);
  }, [contentRef]);

  const drawableEntities = useMemo(() => {
    if (objectType === ObjectType.Language) {
      return entities.filter((obj) => obj.type === ObjectType.Language) as LanguageData[];
    }

    return uniqueBy(
      entities
        .flatMap((obj) => {
          if (obj.type === ObjectType.Territory) return obj;
          if (obj.type === ObjectType.Locale) return obj.territory;
          if (obj.type === ObjectType.Census) return obj.territory;
          if (obj.type === ObjectType.WritingSystem)
            return getObjectLocales(obj).map((l) => l.territory);
          return undefined;
        })
        .filter((t): t is TerritoryData => t !== undefined),
      (t) => t.ID,
    ) as TerritoryData[];
  }, [objectType, entities]);

  const coloringFunctions = useColors({ objects: drawableEntities });

  // Floating cards are derived from the pinned page param so they can be fully restored from the
  // URL after a refresh. Each card is positioned at its entity's Robinson centroid.
  const floatingCards = useMemo<FloatingCard[]>(() => {
    const drawableById = new Map(drawableEntities.map((entity) => [entity.ID, entity]));
    return pinned
      .map((id) => {
        const entity = drawableById.get(id);
        if (entity == null || entity.latitude == null || entity.longitude == null) return undefined;

        const { x: robinsonX, y: robinsonY } = getRobinsonCoordinatesShifted(entity);
        return {
          id,
          entity,
          x: MAP_INTERNAL_WIDTH / 2 + robinsonX * MAP_ROBINSON_X_SCALE,
          y: mapHeight / 2 - robinsonY * MAP_ROBINSON_Y_SCALE,
        };
      })
      .filter((card): card is FloatingCard => card != null);
  }, [pinned, drawableEntities, mapHeight]);

  const openCard = useCallback(
    (entity: DrawableData) => {
      if (pinned.includes(entity.ID)) return;
      updatePageParams({ pinned: [...pinned, entity.ID] });
    },
    [pinned, updatePageParams],
  );

  const closeCard = useCallback(
    (id: string) => {
      updatePageParams({ pinned: pinned.filter((pin) => pin !== id) });
    },
    [pinned, updatePageParams],
  );

  const handleZoomIn = useCallback(() => {
    zoomIn();
    requestAnimationFrame(updateMapScale);
  }, [zoomIn, updateMapScale]);

  const handleZoomOut = useCallback(() => {
    zoomOut();
    requestAnimationFrame(updateMapScale);
  }, [zoomOut, updateMapScale]);

  const handleResetTransform = useCallback(() => {
    resetTransform();
    requestAnimationFrame(updateMapScale);
  }, [resetTransform, updateMapScale]);

  // Restore the map scale on mount so URL-restored cards are sized correctly before any zoom.
  useEffect(() => {
    requestAnimationFrame(updateMapScale);
  }, [updateMapScale]);

  // Clear pinned cards when the object type changes, but not on the initial mount so that pinned
  // cards can still be restored from the URL after a refresh.
  useEffect(() => {
    if (prevObjectTypeRef.current !== objectType) {
      prevObjectTypeRef.current = objectType;
      updatePageParams({ pinned: [] });
    }
  }, [objectType, updatePageParams]);

  return (
    <div style={{ maxWidth, width: '100%', position: 'relative' }}>
      <ZoomControls
        zoomIn={handleZoomIn}
        zoomOut={handleZoomOut}
        resetTransform={handleResetTransform}
      />

      <div
        ref={containerRef}
        style={{
          border: '1px solid #ccc',
          width: '100%',
          aspectRatio: MAP_ASPECT_RATIO,
          overflow: 'hidden',
          cursor: 'grab',
          position: 'relative',
        }}
        onClick={() => updatePageParams({ pinned: [] })}
      >
        <div
          ref={contentRef}
          style={{
            width: MAP_INTERNAL_WIDTH,
            height: mapHeight,
            position: 'relative',
          }}
        >
          <img
            alt="World map"
            src="./data/wiki/map_world.svg"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              top: 0,
              left: 0,
            }}
          />

          {objectType !== ObjectType.Language && (
            <MapTerritories
              drawableEntities={drawableEntities}
              openCard={openCard}
              coloringFunctions={coloringFunctions}
            />
          )}

          <MapCentroids
            drawableEntities={drawableEntities}
            openCard={openCard}
            scalar={1200 / maxWidth}
            zoomFactor={zoomFactor}
            coloringFunctions={coloringFunctions}
          />
          {floatingCards.map((card) => (
            <div
              key={card.id}
              style={{
                position: 'absolute',
                left: card.x,
                top: card.y + 12 / mapScale,
                transform: `translateX(-50%) scale(${1 / mapScale})`,
                transformOrigin: 'top center',
                zIndex: 10,
                cursor: 'default',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <MapCard
                drawnEntity={card.entity}
                objectType={objectType}
                onClose={() => closeCard(card.id)}
              />
            </div>
          ))}
        </div>
      </div>

      {colorBy !== Field.None && <ColorBar coloringFunctions={coloringFunctions} />}
    </div>
  );
};

export default ObjectMap;
