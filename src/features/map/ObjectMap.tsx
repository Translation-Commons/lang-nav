import React, { useCallback, useMemo } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

import { ObjectType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import ColorBar from '@features/transforms/coloring/ColorBar';
import useColors from '@features/transforms/coloring/useColors';

import { LanguageData } from '@entities/language/LanguageTypes';
import { getObjectLocales } from '@entities/lib/getObjectRelatedTerritories';
import { ObjectData, TerritoryData } from '@entities/types/DataTypes';

import { uniqueBy } from '@shared/lib/setUtils';
import DrawableData from './DrawableData';
import MapCircles from './MapCircles';
import MapHoverContent from './MapHoverContent';
import MapTerritories from './MapTerritories';
import ZoomControls from './ZoomControls';

type Props = {
  objects: ObjectData[];
  maxWidth?: number; // in pixels
};

const ObjectMap: React.FC<Props> = ({ objects, maxWidth = 2000 }) => {
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
      <div style={{ border: '1px solid #ccc' }}>
        <TransformWrapper
          initialScale={1}
          minScale={1}
          maxScale={8}
          wheel={{ step: 0.1 }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <ZoomControls
                zoomIn={zoomIn}
                zoomOut={zoomOut}
                resetTransform={resetTransform}
              />
              <TransformComponent
                wrapperStyle={{ width: '100%', cursor: 'grab' }}
                contentStyle={{ width: '100%' }}
              >
                <div style={{ position: 'relative', width: '100%', aspectRatio: 1.979 }}>
                  <img
                    alt="World map"
                    src="./data/wiki/map_world.svg"
                    style={{ position: 'absolute', width: '100%', height: 'auto', top: 0, left: 0 }}
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
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>

      {colorBy != 'None' && <ColorBar coloringFunctions={coloringFunctions} />}
    </div>
  );
};

export default ObjectMap;
