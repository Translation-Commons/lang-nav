import React, { useCallback } from 'react';

import useHoverCard from '@features/layers/hovercard/useHoverCard';
import MapHoverCard from '@features/map/MapHoverCard';
import usePageParams from '@features/params/usePageParams';
import ColorBar from '@features/transforms/coloring/ColorBar';
import ColorGradientSelector from '@features/transforms/coloring/ColorGradientSelector';
import useColors from '@features/transforms/coloring/useColors';
import Field from '@features/transforms/fields/Field';
import getField from '@features/transforms/fields/getField';
import useFilteredEntities from '@features/transforms/filtering/useFilteredEntities';
import getTickMarks from '@features/transforms/getTickMarks';
import useScale from '@features/transforms/scales/useScale';
import FieldDropdown from '@features/transforms/sorting/FieldDropdown';
import useNormalizedValues from '@features/transforms/useNormalizedValues';

import { EntityData } from '@entities/types/DataTypes';

const ScatterPlot: React.FC = () => {
  const { chartX, chartY, scaleBy, colorBy, fieldFocus, updatePageParams } = usePageParams();
  const ents = useFilteredEntities({}).filteredEntities;

  const xValue = useNormalizedValues({ ents, field: chartX });
  const yValue = useNormalizedValues({ ents, field: chartY });
  const coloring = useColors({ ents, colorBy });
  const scaling = useScale({ ents, scaleBy });
  const xTicks = getTickMarks(xValue, 200);
  const yTicks = getTickMarks(yValue, 200);

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
        <div className="absolute top-1/2 left-[-20px] transform -rotate-90 -translate-y-1/2  -translate-x-1/2">
          Y axis: <FieldDropdown pageParam="chartY" />
        </div>
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
          X axis: <FieldDropdown pageParam="chartX" />
        </div>
        <svg viewBox="-12 -10 230 230">
          <g transform="translate(0, 0)">
            {/* Axis labels */}
            <path d="M 0 200 h 200" stroke="var(--muted-foreground)" strokeWidth={0.5} />
            <path d="M 0 0   v 200" stroke="var(--muted-foreground)" strokeWidth={0.5} />
            {xTicks.map((tick, i) => (
              <g key={i} transform={`translate(${tick.position * 200}, 200)`}>
                <path d="M 0 5 v -205" stroke="var(--secondary)" strokeWidth={0.5} />
                <text y={2} fontSize="4" textAnchor="middle" alignmentBaseline="hanging">
                  {tick.label}
                </text>
              </g>
            ))}
            {yTicks.map((tick, i) => (
              <g key={i} transform={`translate(0, ${200 - tick.position * 200})`}>
                <path d="M -5 0 h 205" stroke="var(--secondary)" strokeWidth={0.5} />
                <text
                  key={i}
                  x={tick.label.length > 5 ? 0 : -2}
                  y={tick.label.length > 5 ? -4 : 0}
                  fontSize="4"
                  textAnchor={tick.label.length > 5 ? 'middle' : 'end'}
                  alignmentBaseline="middle"
                  transform={tick.label.length > 5 ? 'rotate(-90)' : undefined}
                >
                  {tick.label}
                </text>
              </g>
            ))}

            {/* Circles */}
            {[...ents].reverse().map((ent) => {
              const fieldXValue = getField(ent, chartX) ?? 0;
              const fieldYValue = getField(ent, chartY) ?? 0;
              const x = xValue.getNormalizedValue(fieldXValue) * 200;
              const y = 200 - yValue.getNormalizedValue(fieldYValue) * 200;
              const color = coloring.getColor(ent);
              const scale = scaling.getScale(ent);
              return (
                <g
                  transform={`translate(${x}, ${y})`}
                  key={ent.ID}
                  onMouseEnter={buildOnMouseEnter(ent)}
                  onMouseLeave={onMouseLeaveTriggeringElement}
                >
                  <circle
                    r={scale}
                    onClick={() => updatePageParams({ entID: ent.ID })}
                    opacity={colorBy === Field.None || color ? 1 : 0.5}
                    fill={colorBy === Field.None ? 'var(--primary)' : (color ?? 'var(--secondary)')}
                  />
                  {fieldFocus != Field.None && (
                    <text fontSize={2 * scale} textAnchor="middle" alignmentBaseline="middle">
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
        {colorBy !== Field.None && <ColorBar coloringFunctions={coloring} />}
        <div className="flex items-center justify-center gap-2">
          Colored by <FieldDropdown pageParam="colorBy" /> <ColorGradientSelector />
        </div>
      </div>
    </div>
  );
};

export default ScatterPlot;
