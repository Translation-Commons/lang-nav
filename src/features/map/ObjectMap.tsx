import React, { useCallback, useMemo } from 'react';

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
import MapCircles from './MapCircles';
import MapHoverContent from './MapHoverContent';
import MapTerritories from './MapTerritories';
import useMapZoom from './UseMapZoom';
import ZoomControls from './ZoomControls';

type Props = {
  objects: ObjectData[];
  maxWidth?: number; // in pixels
};

// Aspect ratio (width/height) of the Robinson projection used in map_world.svg
export const MAP_ASPECT_RATIO = 1.979;
const MAP_WIDTH = 360;
const MAP_HEIGHT = MAP_WIDTH / MAP_ASPECT_RATIO;

const ObjectMap: React.FC<Props> = ({ objects, maxWidth = 2000 }) => {
  const { containerRef, contentRef, zoomIn, zoomOut, resetTransform } = useMapZoom({
    mapWidth: MAP_WIDTH,
    mapHeight: MAP_HEIGHT,
  });
  const { colorBy, objectType } = usePageParams();
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
  const getHoverContent = useCallback(
    (obj: DrawableData) => <MapHoverContent drawnObject={obj} objectType={objectType} />,
    [objects, objectType],
  );

  return (
    <div style={{ maxWidth, width: '100%', position: 'relative' }}>
      <ZoomControls zoomIn={zoomIn} zoomOut={zoomOut} resetTransform={resetTransform} />
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
      >
        <div
          ref={contentRef}
          style={{ width: MAP_WIDTH, height: MAP_HEIGHT, position: 'relative' }}
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
              getHoverContent={getHoverContent}
              coloringFunctions={coloringFunctions}
            />
          )}
          <MapCircles
            drawableObjects={drawableObjects}
            getHoverContent={getHoverContent}
            scalar={1200 / maxWidth}
            coloringFunctions={coloringFunctions}
          />
        </div>
      </div>
      {colorBy !== Field.None && <ColorBar coloringFunctions={coloringFunctions} />}
    </div>
  );
};

export default ObjectMap;
