import React from 'react';

const RADIUS = 7;
const CENTER = 8; // viewBox="0 0 16 16"

type Props = {
  label?: string; // text that appears in the center of the pie chart
  size?: number;

  // Fraction can be a single number (0-1) that will show a slice colored by the hue of the fraction (0 = red, 1 = green)
  fraction: number;
  color?: string; // particular color
};

const Pie: React.FC<Props> = ({ label, fraction, size = 32, color }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className="w-full">
      <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="var(--muted)" />

      <Slice startingAngle={0} arcAngle={fraction} color={color ?? `hsl(${fraction}, 60%, 60%)`} />
      {label && (
        <text x={CENTER} y={CENTER} textAnchor="middle" dominantBaseline="central" fontSize="0.5em">
          {label}
        </text>
      )}
    </svg>
  );
};

const Slice: React.FC<{
  startingAngle: number; // 0-1
  arcAngle: number; // 0–1
  color: string;
}> = ({ startingAngle, arcAngle, color }) => {
  const value = Math.min(1, Math.max(0, arcAngle));

  const startAngle = startingAngle * Math.PI * 2;
  const endAngle = startAngle + value * Math.PI * 2;
  const endX = CENTER + RADIUS * Math.sin(endAngle);
  const endY = CENTER - RADIUS * Math.cos(endAngle);
  const largeArcFlag = value > 0.5 ? 1 : 0;

  const path =
    value === 0 ? null : value === 1 ? (
      <circle cx={CENTER} cy={CENTER} r={RADIUS} />
    ) : (
      <path
        d={[
          `M ${CENTER} ${CENTER}`,
          `L ${CENTER + RADIUS * Math.sin(startAngle)} ${CENTER - RADIUS * Math.cos(startAngle)}`,
          `A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
          'Z',
        ].join(' ')}
      />
    );

  return (
    <g fill={color}>
      {path}
      <line
        x1={CENTER}
        y1={CENTER}
        x2={endX}
        y2={endY}
        stroke={color}
        strokeWidth="0.5"
        filter="brightness(0.8)"
      />
    </g>
  );
};

export default Pie;
