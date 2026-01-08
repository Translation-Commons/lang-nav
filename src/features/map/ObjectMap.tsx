import React from 'react';

import { ObjectType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import ColorBar from '@features/transforms/coloring/ColorBar';
import useColors from '@features/transforms/coloring/useColors';

import { ObjectData } from '@entities/types/DataTypes';

import MapCircles from './MapCircles';
import MapCountry from './MapCountry';

type Props = {
  objects: ObjectData[];
  maxWidth?: number; // in pixels
};

const ObjectMap: React.FC<Props> = ({ objects, maxWidth = 2000 }) => {
  const { colorBy, objectType } = usePageParams();
  const coloringFunctions = useColors({ objects });

  return (
    <div style={{ maxWidth, width: '100%' }}>
      <div style={{ position: 'relative', width: '100%', aspectRatio: 1.979 }}>
        <img
          alt="World map"
          src="./data/wiki/map_world.svg"
          style={{ position: 'absolute', width: '100%', height: 'auto', top: 0, left: 0 }}
        />
        {objectType === ObjectType.Territory && <MapCountry objects={objects} />}
        <MapCircles objects={objects} scalar={2000 / maxWidth} />
      </div>

      {colorBy != 'None' && <ColorBar coloringFunctions={coloringFunctions} />}
    </div>
  );
};

export default ObjectMap;
