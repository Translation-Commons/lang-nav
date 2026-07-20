import React from 'react';

interface Props {
  value: number | null | undefined;
  max: number;
  label: string; // eg. "Institutional", "Living"
  sublabel?: string; // eg. "Ethnologue", "ISO"
  size?: number; // diameter in px, default 80
}

const ArcGauge: React.FC<Props> = ({ value, max, label, sublabel, size = 80 }) => {
  const stroke = size * 0.1;
  const radius = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // Arc goes from 200deg to 340deg (140deg sweep) — a wide semicircle opening downward
  const startAngle = 200;
  const endAngle = 340;
  const sweep = endAngle - startAngle;

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const arcPath = (angle: number) => {
    const x = cx + radius * Math.cos(toRad(angle));
    const y = cy + radius * Math.sin(toRad(angle));
    return { x, y };
  };

  const start = arcPath(startAngle);
  const end = arcPath(endAngle);
  const filledRatio = value != null ? value / max : 0;
  const filled = arcPath(startAngle + sweep * filledRatio);

  const bgArc = `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`;
  const valueArc =
    value != null
      ? `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${filled.x} ${filled.y}`
      : null;

  const ratio = value != null ? value / max : null;
  // Mirrors HTML <meter> color thresholds:
  // min=0   // Extinct
  // low=3   // Shifting/Endangered -- below this, the arc is colored red
  // high=7  // Trade/Stable -- below this, the arc is colored yellow
  // optimum=8 // Regional -- above high is green
  // max=9   // National/Institutional/Living
  const color =
    ratio == null
      ? 'var(--muted-foreground)'
      : ratio >= 7 / 9
        ? 'var(--color-green)'
        : ratio >= 3 / 9
          ? 'var(--color-yellow)'
          : 'var(--color-red)';

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <div className="mb-1 w-max text-[0.8em]">{label}</div>
      <div className="relative" style={{ width: size, height: size * 0.65 }}>
        <svg width={size} height={size} className="absolute top-0 left-0 overflow-visible">
          {/* Background arc */}
          <path
            d={bgArc}
            fill="none"
            stroke="var(--secondary)"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
          {/* Value arc */}
          {valueArc && (
            <path
              d={valueArc}
              fill="none"
              stroke={color}
              strokeWidth={stroke}
              strokeLinecap="round"
            />
          )}
        </svg>
        {/* Score text centered inside arc */}
        <div
          className="absolute inset-x-0 bottom-0 text-center leading-none font-bold"
          style={{ fontSize: size * 0.22 }}
        >
          {value != null ? value : '—'}
          <span className="text-[0.6em] font-normal text-muted-foreground">/{max}</span>
        </div>
      </div>
      {sublabel && <div className="mt-1 text-[0.75em] text-muted-foreground">{sublabel}</div>}
    </div>
  );
};

export default ArcGauge;
