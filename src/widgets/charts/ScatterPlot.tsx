import React, { useCallback } from 'react';

import useHoverCard from '@features/layers/hovercard/useHoverCard';
import MapHoverCard from '@features/map/MapHoverCard';
import usePageParams from '@features/params/usePageParams';
import useColors from '@features/transforms/coloring/useColors';
import getField from '@features/transforms/fields/getField';
import useFilteredEntities from '@features/transforms/filtering/useFilteredEntities';
import FieldDropdown from '@features/transforms/sorting/FieldDropdown';

import { EntityData } from '@entities/types/DataTypes';

const ScatterPlot: React.FC = () => {
  const { limit, chartX, chartY, fieldFocus } = usePageParams();
  const ents = useFilteredEntities({}).filteredEntities;

  const xColoring = useColors({ ents, colorBy: chartX });
  const yColoring = useColors({ ents, colorBy: chartY });

  const { showHoverCard, onMouseLeaveTriggeringElement } = useHoverCard();

  const buildOnMouseEnter = useCallback(
    (ent: EntityData) => (e: React.MouseEvent) => {
      showHoverCard(<MapHoverCard ent={ent} />, e.clientX, e.clientY);
    },
    [showHoverCard],
  );

  return (
    <div>
      <div className="flex flex-row gap-4 justify-center w-full">
        <div>
          X axis: <FieldDropdown pageParam="chartX" />
        </div>
        <div>
          Y axis: <FieldDropdown pageParam="chartY" />
        </div>
      </div>
      <div className="max-w-[600px] mx-auto">
        <svg viewBox="-10 -10 230 230">
          <g transform="translate(0, 0)">
            <path d="M 0 200 h 200" stroke="black" fill="none" />
            <path d="M 0 0   v 200" stroke="black" fill="none" />
            {ents.map((ent, index) => {
              const fieldXValue = getField(ent, chartX) ?? 0;
              const fieldYValue = getField(ent, chartY) ?? 0;
              const x = xColoring.getNormalizedValue(fieldXValue) * 200;
              const y = 200 - yColoring.getNormalizedValue(fieldYValue) * 200;
              return (
                <g
                  transform={`translate(${x}, ${y})`}
                  key={ent.ID}
                  onMouseEnter={buildOnMouseEnter(ent)}
                  onMouseLeave={onMouseLeaveTriggeringElement}
                >
                  <circle r={1} />
                  {limit > index && (
                    <text fontSize="4" textAnchor="middle" alignmentBaseline="middle">
                      {getField(ent, fieldFocus)}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
};

export default ScatterPlot;
