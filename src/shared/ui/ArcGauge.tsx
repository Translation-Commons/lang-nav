import React from 'react';

interface Props {
  value: number | null | undefined;
  max: number;
  label: string;        // eg. "Institutional", "Living"
  sublabel?: string;    // eg. "Ethnologue", "ISO"
  size?: number;        // diameter in px, default 80
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
      ? 'var(--color-text-secondary)'
      : ratio >= 7 / 9
      ? 'var(--color-green)'
      : ratio >= 3 / 9
      ? 'var(--color-yellow)'
      : 'var(--color-red)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: size }}>
      <div style={{ fontSize: '0.8em', marginBottom: '0.25em' }}>{label}</div>
      <div style={{ position: 'relative', width: size, height: size * 0.65 }}>
        <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}>
          {/* Background arc */}
          <path
            d={bgArc}
            fill="none"
            stroke="var(--color-button-secondary)"
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
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontWeight: 700,
          fontSize: size * 0.22,
          lineHeight: 1,
        }}>
          {value != null ? value : '—'}
          <span style={{ fontWeight: 400, fontSize: '0.6em', color: 'var(--color-text-secondary)' }}>
            /{max}
          </span>
        </div>
      </div>
      {sublabel && (
        <div style={{ fontSize: '0.75em', color: 'var(--color-text-secondary)', marginTop: '0.25em' }}>
          {sublabel}
        </div>
      )}
    </div>
  );
};

export default ArcGauge;