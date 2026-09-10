import React, { useCallback } from 'react';

import useHoverCard from '@features/layers/hovercard/useHoverCard';
import MapHoverCard from '@features/map/MapHoverCard';
import usePageParams from '@features/params/usePageParams';
import ColorBar from '@features/transforms/coloring/ColorBar';
import useColors from '@features/transforms/coloring/useColors';
import Field from '@features/transforms/fields/Field';
import getField from '@features/transforms/fields/getField';
import useFilteredEntities from '@features/transforms/filtering/useFilteredEntities';
import FieldDropdown from '@features/transforms/sorting/FieldDropdown';

import { EntityData } from '@entities/types/DataTypes';

const ScatterPlot: React.FC = () => {
  const { entType, limit, chartX, chartY, colorBy, fieldFocus, updatePageParams, scaleFactor } =
    usePageParams();
  const ents = useFilteredEntities({}).filteredEntities;

  const xValue = useColors({ ents, colorBy: chartX });
  const yValue = useColors({ ents, colorBy: chartY });
  const coloring = useColors({ ents, colorBy });

  const { showHoverCard, onMouseLeaveTriggeringElement } = useHoverCard();

  const buildOnMouseEnter = useCallback(
    (ent: EntityData) => (e: React.MouseEvent) => {
      showHoverCard(<MapHoverCard ent={ent} />, e.clientX, e.clientY);
    },
    [showHoverCard],
  );

  return (
    <div>
      <div data-testid="scatter-plot" className="w-[600px] mx-auto relative">
        <div className="absolute top-1/2 left-0 transform -rotate-90 -translate-y-1/2  -translate-x-1/2">
          Y axis: <FieldDropdown pageParam="chartY" />
        </div>
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
          X axis: <FieldDropdown pageParam="chartX" />
        </div>
        <svg viewBox="-10 -10 230 230">
          <g transform="translate(0, 0)">
            <path d="M 0 200 h 200" stroke="var(--muted-foreground)" strokeWidth={0.5} />
            <path d="M 0 0   v 200" stroke="var(--muted-foreground)" strokeWidth={0.5} />
            {[...ents].reverse().map((ent, index) => {
              const fieldXValue = getField(ent, chartX) ?? 0;
              const fieldYValue = getField(ent, chartY) ?? 0;
              const x = xValue.getNormalizedValue(fieldXValue) * 200;
              const y = 200 - yValue.getNormalizedValue(fieldYValue) * 200;
              const color = coloring.getColor(ent);
              return (
                <g
                  transform={`translate(${x}, ${y})`}
                  key={ent.ID}
                  onMouseEnter={buildOnMouseEnter(ent)}
                  onMouseLeave={onMouseLeaveTriggeringElement}
                >
                  <circle
                    r={scaleFactor}
                    onClick={() => updatePageParams({ entID: ent.ID })}
                    opacity={colorBy === Field.None || color ? 1 : 0.5}
                    fill={colorBy === Field.None ? 'var(--primary)' : (color ?? 'var(--secondary)')}
                  />
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
      <div>
        <ColorBar coloringFunctions={coloring} />
        <div>
          Colored by <FieldDropdown pageParam="colorBy" />
        </div>
      </div>
    </div>
  );
};

export default ScatterPlot;
