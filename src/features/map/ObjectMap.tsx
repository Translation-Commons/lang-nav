import React, { useCallback, useMemo } from 'react';

import { ObjectType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import ColorBar from '@features/transforms/coloring/ColorBar';
import useColors from '@features/transforms/coloring/useColors';

import { ObjectData, TerritoryData } from '@entities/types/DataTypes';
import ObjectCard from '@entities/ui/ObjectCard';

import { uniqueBy } from '@shared/lib/setUtils';

import MapCircles from './MapCircles';
import MapHoverContent from './MapHoverContent';
import MapTerritories from './MapTerritories';

type Props = {
  objects: ObjectData[];
  maxWidth?: number; // in pixels
};

const ObjectMap: React.FC<Props> = ({ objects, maxWidth = 2000 }) => {
  const { colorBy, objectType } = usePageParams();
  const applicableTerritories = useMemo(
    () =>
      uniqueBy(
        objects
          .map((obj) => {
            if (obj.type === ObjectType.Territory) return obj;
            if (obj.type === ObjectType.Locale) return obj.territory;
            if (obj.type === ObjectType.Census) return obj.territory;
            return undefined;
          })
          .filter((t): t is TerritoryData => t !== undefined),
        (t) => t.ID,
      ),
    [objects],
  );
  const coloringFunctions = useColors({
    objects: objectType === ObjectType.Language ? objects : applicableTerritories,
  });
  const getHoverContent = useCallback(
    (obj: ObjectData) => {
      if (obj.type === ObjectType.Language) return <ObjectCard object={obj} />;
      return (
        <MapHoverContent
          territory={obj as TerritoryData}
          objects={objects}
          objectType={objectType}
        />
      );
    },
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
            objects={objects}
            applicableTerritories={applicableTerritories}
            getHoverContent={getHoverContent}
            coloringFunctions={coloringFunctions}
          />
        )}
        <MapCircles
          objects={objectType === ObjectType.Language ? objects : applicableTerritories}
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
