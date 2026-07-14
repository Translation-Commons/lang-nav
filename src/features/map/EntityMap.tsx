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
import MapCentroids from './MapCentroids';
import { MAP_ASPECT_RATIO, MAP_INTERNAL_WIDTH } from './MapConsts';
import MapSidebar from './MapSidebar';
import MapTerritories from './MapTerritories';
import useMapZoom from './UseMapZoom';
import ZoomControls from './ZoomControls';

import './map.css';

type Props = {
  entities: ObjectData[];
  maxWidth?: number;
  allowSidebar?: boolean;
  // Fires on every zoom/pan change with the current zoom multiplier (1 = fully
  // zoomed out). Lets callers react to zoom level, e.g. to progressively reveal
  // more entities as the user zooms in. Should be a stable reference (e.g. a
  // useState setter) — useMapZoom's internal effect only captures onZoom once
  // on mount, so a callback that changes identity across renders would go stale.
  onZoomChange?: (zoomFactor: number) => void;
};

const EntityMap: React.FC<Props> = ({
  entities,
  maxWidth = 2000,
  allowSidebar = false,
  onZoomChange,
}) => {
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
  } = useMapZoom({
    mapWidth: MAP_INTERNAL_WIDTH,
    mapHeight,
    onZoom: (factor) => {
      setZoomFactor(factor);
      onZoomChange?.(factor);
    },
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
