import React, { useCallback, useMemo } from 'react';

import { ObjectType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import ColorBar from '@features/transforms/coloring/ColorBar';
import useColors from '@features/transforms/coloring/useColors';

import { LanguageData } from '@entities/language/LanguageTypes';
import { ObjectData, TerritoryData } from '@entities/types/DataTypes';

import { uniqueBy } from '@shared/lib/setUtils';

import DrawableData from './DrawableData';
import MapCircles from './MapCircles';
import MapHoverContent from './MapHoverContent';
import MapTerritories from './MapTerritories';

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
        .map((obj) => {
          if (obj.type === ObjectType.Territory) return obj;
          if (obj.type === ObjectType.Locale) return obj.territory;
          if (obj.type === ObjectType.Census) return obj.territory;
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
    <div style={{ maxWidth, width: '100%' }}>
      <div style={{ position: 'relative', width: '100%', aspectRatio: 1.979 }}>
        <img
          alt="World map"
          src="./data/wiki/map_world.svg"
          style={{ position: 'absolute', width: '100%', height: 'auto', top: 0, left: 0 }}
        />
        {(objectType === ObjectType.Territory || objectType === ObjectType.Census) && (
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

      {colorBy != 'None' && <ColorBar coloringFunctions={coloringFunctions} />}
    </div>
  );
};

export default ObjectMap;
