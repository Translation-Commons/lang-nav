import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import PinnedMiniCardList from '@widgets/cardlists/PinnedMiniCardList';

import { EntityType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import ColorBar from '@features/transforms/coloring/ColorBar';
import useColors from '@features/transforms/coloring/useColors';
import Field from '@features/transforms/fields/Field';
import { getSortFunction } from '@features/transforms/sorting/sort';

import { LanguageData } from '@entities/language/LanguageTypes';
import { getEntityLocales } from '@entities/lib/getEntityRelatedTerritories';
import { LocaleData } from '@entities/locale/LocaleTypes';
import { TerritoryData } from '@entities/territory/TerritoryTypes';
import { EntityData } from '@entities/types/DataTypes';

import { uniqueBy } from '@shared/lib/setUtils';

import DrawableData from './DrawableData';
import './map.css';
import MapCentroids from './MapCentroids';
import { MAP_ASPECT_RATIO, MAP_INTERNAL_WIDTH } from './MapConsts';
import MapTerritories from './MapTerritories';
import useMapZoom from './UseMapZoom';
import computeEntityBounds from './zoom/computeEntityBounds';
import ZoomControls from './ZoomControls';

type Props = {
  entities: EntityData[];
  maxWidth?: number;
  allowSidebar?: boolean;
  allowColorBar?: boolean;
};

const EntityMap: React.FC<Props> = ({
  entities,
  maxWidth = 2000,
  allowSidebar = false,
  allowColorBar = true,
}) => {
  const mapHeight = MAP_INTERNAL_WIDTH / MAP_ASPECT_RATIO;
  const { pageBrightness } = usePageParams().brightness;
  const sortFunction = getSortFunction();

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

  const { colorBy, entType, pinned, updatePageParams } = usePageParams();
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

  const sortedEntities = useMemo(() => [...entities].sort(sortFunction), [entities, sortFunction]);

  const drawableEntities = useMemo(() => {
    if (entType === EntityType.Language) {
      return sortedEntities.filter((ent) => ent.type === EntityType.Language) as LanguageData[];
    }

    if (entType === EntityType.Locale) {
      return uniqueBy(
        sortedEntities.filter(
          (ent) => ent.type === EntityType.Locale && ent.territory != null,
        ) as LocaleData[],
        (l) => l.territory?.ID || '',
      ) as LocaleData[];
    }

    return uniqueBy(
      sortedEntities
        .flatMap((ent) => {
          if (ent.type === EntityType.Territory) return ent;
          if (ent.type === EntityType.Locale) return ent;
          if (ent.type === EntityType.Census) return ent.territory;
          if (ent.type === EntityType.WritingSystem)
            return getEntityLocales(ent).map((l) => l.territory);
          return undefined;
        })
        .filter((t): t is TerritoryData => t !== undefined),
      (t) => t.ID,
    ) as TerritoryData[];
  }, [entType, sortedEntities]);

  // Bounding box (in map coordinates) of the entities that will be drawn as centroids,
  // so we can zoom the map to fit them instead of always showing the whole world.
  const entityBounds = useMemo(
    () => computeEntityBounds(drawableEntities, mapHeight),
    [drawableEntities, mapHeight],
  );

  const hasInitialFitRef = useRef(false);
  const lastAutoFitBoundsRef = useRef<string | null>(null);
  useEffect(() => {
    if (!entityBounds) return;
    const boundsKey = [
      entityBounds.minX.toFixed(2),
      entityBounds.minY.toFixed(2),
      entityBounds.maxX.toFixed(2),
      entityBounds.maxY.toFixed(2),
    ].join(':');
    if (lastAutoFitBoundsRef.current === boundsKey) return;

    // Instant on first load to avoid a flash from full-map to fitted; animate afterwards
    // when the visible entities change.
    fitBounds(entityBounds, { duration: hasInitialFitRef.current ? 400 : 0 });
    hasInitialFitRef.current = true;
    lastAutoFitBoundsRef.current = boundsKey;
  }, [entityBounds, fitBounds]);

  const coloringFunctions = useColors({ ents: drawableEntities });

  const onClick = useCallback(
    (entity: DrawableData) => {
      if (allowSidebar) {
        if (pinned.includes(entity.ID)) {
          updatePageParams({ pinned: pinned.filter((id) => id !== entity.ID) });
        } else {
          updatePageParams({ pinned: [...pinned, entity.ID] });
        }
      } else {
        updatePageParams({ entID: entity.ID });
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

            {entType !== EntityType.Language && (
              <MapTerritories
                drawableEntities={drawableEntities}
                onClick={onClick}
                coloringFunctions={coloringFunctions}
                pinnedIds={allowSidebar ? pinned : []}
                allowSidebar={allowSidebar}
              />
            )}

            <MapCentroids
              drawableEntities={drawableEntities}
              onClick={onClick}
              scalar={1200 / maxWidth}
              zoomFactor={zoomFactor}
              coloringFunctions={coloringFunctions}
              pinnedIds={allowSidebar ? pinned : []}
              allowSidebar={allowSidebar}
            />
          </div>
        </div>

        {colorBy !== Field.None && allowColorBar && (
          <ColorBar coloringFunctions={coloringFunctions} />
        )}
        {allowSidebar && <PinnedMiniCardList />}
      </div>
    </div>
  );
};

export default EntityMap;
