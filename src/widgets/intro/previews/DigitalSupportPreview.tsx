import React from 'react';

import { ColorGradient } from '@features/transforms/coloring/ColorTypes';
import { getColorGradientFunction } from '@features/transforms/coloring/getColorGradientFunction';

import { PreviewSvg } from './PreviewPrimitives';

type Dot = { x: number; y: number; support?: number };

const yForLiteracy = (percent: number) => 25 + (100 - percent) * 5.22;
const LITERACY_TICKS = [100, 90, 80, 70, 60, 50, 40];
const POPULATION_TICKS = [105, 180, 255, 330, 405, 480, 555];

// [literacy %, spread, count]: literacy data clusters at a few census-rounded values.
const BANDS = [
  [100, 0.6, 140],
  [95, 2.2, 110],
  [91, 1.8, 70],
  [85, 8, 60],
  [75, 8, 60],
  [71, 0.4, 40],
  [62, 0.6, 50],
  [61, 0.3, 40],
  [57, 0.4, 40],
  [50, 0.5, 20],
  [45, 6, 40],
];

// Seeded so the illustration is identical on every render. Bigger languages (further
// right) tend to have more digital support; dots without data are grey.
function makeDots(): Dot[] {
  let seed = 11;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const clamp = (n: number) => Math.min(1, Math.max(0, n));
  return BANDS.flatMap(([center, spread, count]) =>
    Array.from({ length: count }, () => {
      const position = clamp(0.5 + (random() + random() + random() - 1.5) * 0.42);
      const x = 40 + position * 520;
      const y = yForLiteracy(center + (random() - 0.5) * spread * 2);
      if (random() < (position < 0.35 ? 0.65 : 0.15)) return { x, y };
      return { x, y, support: clamp((position - 0.2) * 1.15 + (random() - 0.5) * 0.3) };
    }),
  );
}

const DOTS = makeDots();
const colorForSupport = getColorGradientFunction(ColorGradient.StopLightRedToGreen);

const DigitalSupportPreview: React.FC<{ className?: string }> = ({ className }) => (
  <PreviewSvg
    width={600}
    height={338}
    label="Scatter chart of literacy against population, colored from red for low digital support to green for high"
    className={className}
  >
    {POPULATION_TICKS.map((x) => (
      <line key={x} x1={x} x2={x} y1={18} y2={338} className="stroke-muted" />
    ))}
    {LITERACY_TICKS.map((percent) => (
      <React.Fragment key={percent}>
        <line
          x1={30}
          x2={600}
          y1={yForLiteracy(percent)}
          y2={yForLiteracy(percent)}
          className="stroke-muted"
        />
        <text
          x={27}
          y={yForLiteracy(percent) + 4}
          fontSize={11}
          textAnchor="end"
          className="fill-foreground"
        >
          {percent}%
        </text>
      </React.Fragment>
    ))}
    <line x1={30} x2={30} y1={18} y2={338} className="stroke-muted-foreground/40" />
    {DOTS.map(({ x, y, support }, i) =>
      support == null ? (
        <circle key={i} cx={x} cy={y} r={3} className="fill-muted-foreground/25" />
      ) : (
        <circle key={i} cx={x} cy={y} r={3} fill={colorForSupport(support)} opacity={0.9} />
      ),
    )}
  </PreviewSvg>
);

export default DigitalSupportPreview;
