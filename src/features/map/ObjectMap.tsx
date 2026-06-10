import React, { useCallback, useEffect, useMemo, useState } from 'react';

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
import MapCard from './MapCard';
import MapCentroids from './MapCentroids';
import { MAP_ASPECT_RATIO, MAP_INTERNAL_WIDTH } from './MapConsts';
import MapTerritories from './MapTerritories';
import useMapZoom from './UseMapZoom';
import ZoomControls from './ZoomControls';

type Props = {
  objects: ObjectData[];
  maxWidth?: number;
};

type FloatingCard = {
  id: string;
  object: DrawableData;
  x: number;
  y: number;
};

const ObjectMap: React.FC<Props> = ({ objects, maxWidth = 2000 }) => {
  const mapHeight = MAP_INTERNAL_WIDTH / MAP_ASPECT_RATIO;

  const [zoomFactor, setZoomFactor] = useState(1);

  const { containerRef, contentRef, zoomIn, zoomOut, resetTransform } = useMapZoom({
    mapWidth: MAP_INTERNAL_WIDTH,
    mapHeight,
    onZoom: setZoomFactor,
  });

  const { colorBy, objectType } = usePageParams();
  const [floatingCards, setFloatingCards] = useState<FloatingCard[]>([]);
  const [mapScale, setMapScale] = useState(1);

  const updateMapScale = useCallback(() => {
    const rect = contentRef.current?.getBoundingClientRect();
    if (!rect) return;

    setMapScale(rect.width / MAP_INTERNAL_WIDTH);
  }, [contentRef]);

  const drawableObjects = useMemo(() => {
    if (objectType === ObjectType.Language) {
      return objects.filter((obj) => obj.type === ObjectType.Language) as LanguageData[];
    }

    return uniqueBy(
      objects
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
  }, [objectType, objects]);

  const coloringFunctions = useColors({ objects: drawableObjects });

  const openCard = useCallback(
    (object: DrawableData, clientX: number, clientY: number) => {
      const rect = contentRef.current?.getBoundingClientRect();
      if (!rect) return;

      const scale = rect.width / MAP_INTERNAL_WIDTH;
      setMapScale(scale);

      const x = ((clientX - rect.left) / rect.width) * MAP_INTERNAL_WIDTH;
      const y = ((clientY - rect.top) / rect.height) * mapHeight;

      setFloatingCards((prev) => [
        ...prev.filter((card) => card.id !== object.ID),
        { id: object.ID, object, x, y },
      ]);
    },
    [contentRef, mapHeight],
  );

  const closeCard = useCallback((id: string) => {
    setFloatingCards((prev) => prev.filter((card) => card.id !== id));
  }, []);

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

  useEffect(() => {
    setFloatingCards([]);
  }, [objectType]);

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
        onClick={() => setFloatingCards([])}
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
              drawableObjects={drawableObjects}
              openCard={openCard}
              coloringFunctions={coloringFunctions}
            />
          )}

          <MapCentroids
            drawableObjects={drawableObjects}
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
                drawnObject={card.object}
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
