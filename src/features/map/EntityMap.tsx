import React, { useCallback, useMemo, useState } from 'react';

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

type Props = {
  entities: ObjectData[];
  maxWidth?: number;
};

const EntityMap: React.FC<Props> = ({ entities, maxWidth = 2000 }) => {
  const mapHeight = MAP_INTERNAL_WIDTH / MAP_ASPECT_RATIO;
  const { pageBrightness } = usePageParams().brightness;

  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const [zoomFactor, setZoomFactor] = useState(1);

  const { containerRef, contentRef, zoomIn, zoomOut, resetTransform } = useMapZoom({
    mapWidth: MAP_INTERNAL_WIDTH,
    mapHeight,
    onZoom: setZoomFactor,
  });

  const { colorBy, objectType, pinned, updatePageParams } = usePageParams();

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

  const pinnedEntities = useMemo(() => {
    const drawableById = new Map(drawableEntities.map((entity) => [entity.ID, entity]));
    return pinned
      .map((id) => drawableById.get(id))
      .filter((entity): entity is DrawableData => entity != null);
  }, [pinned, drawableEntities]);

  const pinCard = useCallback(
    (entity: DrawableData) => {
      if (pinned.includes(entity.ID)) {
        updatePageParams({ pinned: pinned.filter((id) => id !== entity.ID) });
      } else {
        updatePageParams({ pinned: [...pinned, entity.ID] });
      }
    },
    [pinned, updatePageParams],
  );

  const unpinCard = useCallback(
    (id: string) => {
      updatePageParams({ pinned: pinned.filter((pin) => pin !== id) });
    },
    [pinned, updatePageParams],
  );

  return (
    <div style={{ maxWidth, width: '100%', position: 'relative' }}>
      <ZoomControls zoomIn={zoomIn} zoomOut={zoomOut} resetTransform={resetTransform} />

      <div
        style={{
          border: '1px solid var(--color-text-secondary)',
          width: '100%',
          aspectRatio: MAP_ASPECT_RATIO,
          display: 'flex',
          overflow: 'hidden',
          background: 'var(--color-background)',
        }}
      >
        <MapSidebar
          pinnedEntities={pinnedEntities}
          objectType={objectType}
          onClose={unpinCard}
          hoveredId={hoveredId}
          setHoveredId={setHoveredId}
        />

        <div
          ref={containerRef}
          style={{
            flex: 1,
            overflow: 'hidden',
            cursor: 'grab',
            position: 'relative',
          }}
        >
          <div
            ref={contentRef}
            style={{ width: MAP_INTERNAL_WIDTH, height: mapHeight, position: 'relative' }}
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
                filter: pageBrightness === 'dark' ? 'invert(100%)' : undefined,
              }}
            />

            {objectType !== ObjectType.Language && (
              <MapTerritories
                drawableEntities={drawableEntities}
                pinCard={pinCard}
                coloringFunctions={coloringFunctions}
                hoveredId={hoveredId}
                pinnedIds={pinned}
              />
            )}

            <MapCentroids
              drawableEntities={drawableEntities}
              pinCard={pinCard}
              scalar={1200 / maxWidth}
              zoomFactor={zoomFactor}
              coloringFunctions={coloringFunctions}
              hoveredId={hoveredId}
              pinnedIds={pinned}
            />
          </div>
        </div>
      </div>

      {colorBy !== Field.None && <ColorBar coloringFunctions={coloringFunctions} />}
    </div>
  );
};

export default EntityMap;
