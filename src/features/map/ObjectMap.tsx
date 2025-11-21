import React from 'react';

import usePageParams from '@features/page-params/usePageParams';
import ColorBar from '@features/transforms/coloring/ColorBar';
import useColors from '@features/transforms/coloring/useColors';

import { ObjectData } from '@entities/types/DataTypes';

import MapCircles from './MapCircles';

type Props = {
  objects: ObjectData[];
  maxWidth?: number; // in pixels
};

const ObjectMap: React.FC<Props> = ({ objects, maxWidth = 800 }) => {
  const { colorBy } = usePageParams();
  const coloringFunctions = useColors({ objects });

  return (
    <div style={{ maxWidth, width: '100%' }}>
      <div style={{ position: 'relative', width: '100%', aspectRatio: 1.979 }}>
        <img
          alt="World map"
          src="./data/wiki/map_world.svg"
          style={{ position: 'absolute', width: '100%', height: 'auto', top: 0, left: 0 }}
        />
        <MapCircles objects={objects} scalar={800 / maxWidth} />
      </div>

      {colorBy != 'None' && <ColorBar coloringFunctions={coloringFunctions} />}
    </div>
  );
};

export default ObjectMap;
