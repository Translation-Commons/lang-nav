import React, { useCallback, useMemo } from 'react';

import { getSliceFunction } from '@features/filtering/filter';
import useHoverCard from '@features/hovercard/useHoverCard';
import { ObjectType } from '@features/page-params/PageParamTypes';

import { LanguageData } from '@entities/language/LanguageTypes';
import { ObjectData } from '@entities/types/DataTypes';
import ObjectCard from '@entities/ui/ObjectCard';

type Props = {
  objects: ObjectData[];
  width?: number; // in pixels
};

const ObjectMap: React.FC<Props> = ({ objects, width = 600 }) => {
  const sliceFunction = getSliceFunction<ObjectData>();
  const renderableObjects: LanguageData[] = useMemo(() => {
    return sliceFunction(
      objects.filter((obj) => obj.type === ObjectType.Language),
    ) as LanguageData[];
  }, [objects, sliceFunction]);
  const { showHoverCard, onMouseLeaveTriggeringElement } = useHoverCard();

  const buildOnMouseEnter = useCallback(
    (obj: ObjectData) => (e: React.MouseEvent) => {
      showHoverCard(<ObjectCard object={obj} />, e.clientX, e.clientY);
    },
    [showHoverCard],
  );

  return (
    <div style={{ width }}>
      <svg
        width="100%"
        height="auto"
        viewBox={`-180 -90 360 180`}
        preserveAspectRatio="xMidYMid meet"
        style={{
          border: '1px solid #ccc',
          backgroundColor: 'var(--color-background)',
          display: 'block',
        }}
      >
        {/* External equirectangular SVG background (world map) */}
        <image
          href="https://upload.wikimedia.org/wikipedia/commons/9/9f/BlankMap-World-Equirectangular.svg"
          x={-186}
          y={-97.75} // squishing since the svg has extra padding
          width={400}
          height={198}
          preserveAspectRatio="none"
          opacity={1}
          pointerEvents="none"
        />

        {renderableObjects.map((obj, idx) => {
          if (obj.latitude == null || obj.longitude == null) {
            return null;
          }
          return (
            <g key={idx}>
              <circle
                cx={obj.longitude}
                cy={-obj.latitude}
                r={2}
                fill="red"
                stroke="black"
                strokeWidth={0.5}
                onMouseEnter={buildOnMouseEnter(obj)}
                onMouseLeave={onMouseLeaveTriggeringElement}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default ObjectMap;
