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
import MapCentroids from './MapCentroids';
import {
  MAP_ASPECT_RATIO,
  MAP_INTERNAL_WIDTH,
  MAP_ROBINSON_X_SCALE,
  MAP_ROBINSON_Y_SCALE,
} from './MapConsts';
import MapSidebar from './MapSidebar';
import MapTerritories from './MapTerritories';
import useMapZoom from './UseMapZoom';
import ZoomControls from './ZoomControls';

import './map.css';

type Props = {
  entities: ObjectData[];
  maxWidth?: number;
  allowSidebar?: boolean;
};

const EntityMap: React.FC<Props> = ({ entities, maxWidth = 2000, allowSidebar = false }) => {
  const mapHeight = MAP_INTERNAL_WIDTH / MAP_ASPECT_RATIO;
  const { pageBrightness } = usePageParams().brightness;

  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const [zoomFactor, setZoomFactor] = useState(1);

  const {
    containerRef: zoomContainerRef,
    contentRef,
    zoomIn,
    zoomOut,
    resetTransform,
    fitBounds,
  } = useMapZoom({
    mapWidth: MAP_INTERNAL_WIDTH,
    mapHeight,
    onZoom: setZoomFactor,
  });

  const { colorBy, objectType, pinned, updatePageParams } = usePageParams();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapContainerWidth, setMapContainerWidth] = useState(800);

  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setMapContainerWidth(width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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

  // Bounding box (in map coordinates) of the entities that will be drawn as centroids,
  // so we can zoom the map to fit them instead of always showing the whole world.
  const entityBounds = useMemo(() => {
    // The centroid SVG uses viewBox "-180 -90 360 180" with preserveAspectRatio
    // "xMidYMid meet", rendered into the content element (MAP_INTERNAL_WIDTH x mapHeight).
    const svgScale = Math.min(MAP_INTERNAL_WIDTH / 360, mapHeight / 180);
    const offsetX = (MAP_INTERNAL_WIDTH - 360 * svgScale) / 2;
    const offsetY = (mapHeight - 180 * svgScale) / 2;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let count = 0;

    drawableEntities.forEach((obj) => {
      if (obj.latitude == null || obj.longitude == null) return;
      const { x, y } = getRobinsonCoordinatesShifted(obj);
      const mapX = (x * MAP_ROBINSON_X_SCALE + 180) * svgScale + offsetX;
      const mapY = (-y * MAP_ROBINSON_Y_SCALE + 90) * svgScale + offsetY;
      minX = Math.min(minX, mapX);
      maxX = Math.max(maxX, mapX);
      minY = Math.min(minY, mapY);
      maxY = Math.max(maxY, mapY);
      count++;
    });

    if (count === 0) return null;
    return { minX, minY, maxX, maxY };
  }, [drawableEntities, mapHeight]);

  const hasInitialFitRef = useRef(false);
  useEffect(() => {
    if (!entityBounds) return;
    // Instant on first load to avoid a flash from full-map to fitted; animate afterwards
    // when the visible entities change.
    fitBounds(entityBounds, { duration: hasInitialFitRef.current ? 400 : 0 });
    hasInitialFitRef.current = true;
  }, [entityBounds, fitBounds]);

  const coloringFunctions = useColors({ objects: drawableEntities });

  const onClick = useCallback(
    (entity: DrawableData) => {
      if (allowSidebar) {
        if (pinned.includes(entity.ID)) {
          updatePageParams({ pinned: pinned.filter((id) => id !== entity.ID) });
        } else {
          updatePageParams({ pinned: [...pinned, entity.ID] });
        }
      } else {
        updatePageParams({ objectID: entity.ID });
      }
    },
    [pinned, updatePageParams, allowSidebar],
  );

  return (
    <div ref={mapContainerRef} className="EntityMap" style={{ maxWidth: maxWidth }}>
      <ZoomControls
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        resetTransform={resetTransform}
        containerWidth={mapContainerWidth}
      />
      {allowSidebar && (
        <MapSidebar
          drawableEntities={drawableEntities}
          objectType={objectType}
          hoveredId={hoveredId}
          setHoveredId={setHoveredId}
        />
      )}

      <div className="MapColorBarAndZoomContainer">
        <div className="MapZoomContainer" ref={zoomContainerRef}>
          <div
            ref={contentRef}
            style={{ width: MAP_INTERNAL_WIDTH, height: mapHeight, position: 'relative' }}
          >
            <img
              alt="World map"
              className="MapLayer"
              src="./data/wiki/map_world.svg"
              style={{ filter: pageBrightness === 'dark' ? 'invert(100%)' : undefined }}
            />

            {objectType !== ObjectType.Language && (
              <MapTerritories
                drawableEntities={drawableEntities}
                onClick={onClick}
                coloringFunctions={coloringFunctions}
                hoveredId={hoveredId}
                pinnedIds={allowSidebar ? pinned : []}
              />
            )}

            <MapCentroids
              drawableEntities={drawableEntities}
              onClick={onClick}
              scalar={1200 / maxWidth}
              zoomFactor={zoomFactor}
              coloringFunctions={coloringFunctions}
              hoveredId={hoveredId}
              pinnedIds={allowSidebar ? pinned : []}
              allowSidebar={allowSidebar}
            />
          </div>
        </div>

        {colorBy !== Field.None && <ColorBar coloringFunctions={coloringFunctions} />}
      </div>
    </div>
  );
};

export default EntityMap;
