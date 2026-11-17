import React, { useCallback, useMemo } from 'react';

import useHoverCard from '@features/layers/hovercard/useHoverCard';
import MapHoverCard from '@features/map/MapHoverCard';
import { useDataVizParams } from '@features/params/DataVizParamsProvider';
import usePageParams from '@features/params/usePageParams';
import ColorBar from '@features/transforms/coloring/ColorBar';
import ColorGradientSelector from '@features/transforms/coloring/ColorGradientSelector';
import useColors from '@features/transforms/coloring/useColors';
import Field from '@features/transforms/fields/Field';
import getField from '@features/transforms/fields/getField';
import useFilteredEntities from '@features/transforms/filtering/useFilteredEntities';
import getTickMarks from '@features/transforms/getTickMarks';
import { Axis, AxisScale } from '@features/transforms/scales/AxisScale';
import getAxisScaleLabel from '@features/transforms/scales/getAxisScaleLabel';
import getDefaultAxisScale from '@features/transforms/scales/getDefaultAxisScale';
import useScale from '@features/transforms/scales/useScale';
import FieldDropdown from '@features/transforms/sorting/FieldDropdown';
import useNormalizedValues, {
  NormalizingFunctions,
} from '@features/transforms/useNormalizedValues';

import { EntityData } from '@entities/types/EntityTypes';

import { countOccurrences } from '@shared/lib/setUtils';
import { convertAlphaToNumber } from '@shared/lib/stringUtils';
import EnumDropdown from '@shared/ui/EnumDropdown';

const INTERNAL_HEIGHT = 200;

const ScatterPlot: React.FC = () => {
  const { chartX, chartY, scaleBy, colorBy, fieldFocus, updatePageParams } = usePageParams();
  const { scale, disperse } = useDataVizParams();
  const ents = useFilteredEntities({}).filteredEntities;

  const xValue = useNormalizedValues({ ents, field: chartX, scale: scale?.[Axis.X] });
  const yValue = useNormalizedValues({ ents, field: chartY, scale: scale?.[Axis.Y] });
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

  // Count the prevalence of each normalized value among the entities so we can add dithering when there are too many
  const yCounts = useMemo(
    () =>
      countOccurrences(ents.map((ent) => yValue.getNormalizedValue(getField(ent, chartY) ?? 0))),
    [ents, yValue, chartY],
  );
  const xCounts = useMemo(
    () =>
      countOccurrences(ents.map((ent) => xValue.getNormalizedValue(getField(ent, chartX) ?? 0))),
    [ents, xValue, chartX],
  );

  const getChartCoordinate = useCallback(
    (ent: EntityData, norm: NormalizingFunctions, counts: Record<number, number>, seed: number) => {
      const value = norm.getNormalizedValue(getField(ent, norm.field) ?? 0);
      // if (counts[value] < 100) return value * 200;

      // If there are more than 100 occurrences of this value, apply dithering to spread them out
      const offset = (((convertAlphaToNumber(ent.ID + norm.field) * seed) % 43) - 21.5) / 21.5 ** 3;
      return value * 200 + ((offset * (counts[value] ?? 0)) / ents.length) * (disperse ?? 0) * 2000;
    },
    [ents.length, disperse],
  );

  return (
    <div>
      <div data-testid="scatter-plot" className="w-[600px] mx-auto relative">
        <div className="absolute top-1/2 left-[-20px] transform -rotate-90 -translate-y-1/2  -translate-x-1/2">
          Y axis: <FieldDropdown pageParam="chartY" />{' '}
          <ScaleDropdown axis={Axis.Y} field={chartY} />
        </div>
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
          X axis: <FieldDropdown pageParam="chartX" />{' '}
          <ScaleDropdown axis={Axis.X} field={chartX} />
        </div>
        <svg viewBox="-12 -10 230 230">
          <g transform="translate(0, 0)">
            {/* Axis labels */}
            <path d="M 0 200 h 200" stroke="var(--muted-foreground)" strokeWidth={0.5} />
            <path d="M 0 0   v 200" stroke="var(--muted-foreground)" strokeWidth={0.5} />
            {xTicks.map((tick, i) => (
              <g
                key={i}
                transform={`translate(${tick.position * INTERNAL_HEIGHT}, ${INTERNAL_HEIGHT})`}
              >
                <path d="M 0 5 v -205" stroke="var(--secondary)" strokeWidth={0.5} />
                <text y={2} fontSize="4" textAnchor="middle" alignmentBaseline="hanging">
                  {tick.label}
                </text>
              </g>
            ))}
            {yTicks.map((tick, i) => (
              <g
                key={i}
                transform={`translate(0, ${INTERNAL_HEIGHT - tick.position * INTERNAL_HEIGHT})`}
              >
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
              const x = getChartCoordinate(ent, xValue, xCounts, 131);
              const y = INTERNAL_HEIGHT - getChartCoordinate(ent, yValue, yCounts, 137);
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
          Colored by <FieldDropdown pageParam="colorBy" /> <ColorGradientSelector />{' '}
          <ScaleDropdown axis={Axis.Color} field={colorBy} />
        </div>
      </div>
    </div>
  );
};

type ScaleDropdownProps = {
  field: Field;
  axis: Axis;
};

function ScaleDropdown({ field, axis }: ScaleDropdownProps) {
  const { scale, setScale } = useDataVizParams();
  const defaultScale = getDefaultAxisScale(field);
  let currentScale = scale?.[axis];
  if (currentScale == null || currentScale === AxisScale.Default) currentScale = defaultScale;
  const onChange = setScale != null ? (scale: AxisScale) => setScale(axis, scale) : () => {};

  return (
    <EnumDropdown
      value={currentScale}
      options={Object.values(AxisScale).filter((v) => typeof v === 'number')}
      onChange={onChange}
      getLabel={(s) => getAxisScaleLabel(s, 'short')}
      buttonClassname="min-w-10 w-12"
      popupClassname="min-w-20"
    />
  );
}

export default ScatterPlot;
