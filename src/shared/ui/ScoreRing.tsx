import React, { useId } from 'react';

interface Props {
  value: number | null | undefined;
  max: number;
  size?: number; // diameter in px
  label?: string; // accessible name, eg. "Keyboards score"
}

// Mirrors the HTML <meter> thresholds used elsewhere for these scores:
// below 3/10 is red, up to 7/10 is yellow, above that is green.
function getScoreColor(ratio: number | null): string {
  if (ratio == null) return 'var(--color-text-secondary)';
  if (ratio >= 0.7) return 'var(--color-green)';
  if (ratio >= 0.3) return 'var(--color-yellow)';
  return 'var(--color-red)';
}

const ScoreRing: React.FC<Props> = ({ value, max, size = 44, label }) => {
  const gradientId = useId();
  const glowId = useId();
  const stroke = size * 0.12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = value != null ? Math.min(Math.max(value / max, 0), 1) : null;
  const color = getScoreColor(ratio);

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={value ?? undefined}
      aria-valuemin={0}
      aria-valuemax={max}
      title={value != null ? `${value} out of ${max}` : undefined}
      style={{
        position: 'relative',
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      <svg width={size} height={size}>
        <defs>
          {/* Diagonal light-to-base sweep reads as a sheen across the arc */}
          <linearGradient
            id={gradientId}
            gradientUnits="userSpaceOnUse"
            x1={0}
            y1={0}
            x2={size}
            y2={size}
          >
            <stop offset="0%" stopColor={`color-mix(in srgb, ${color} 72%, white)`} />
            <stop offset="60%" stopColor={color} />
            <stop offset="100%" stopColor={`color-mix(in srgb, ${color} 92%, black)`} />
          </linearGradient>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow
              dx="0"
              dy={size * 0.015}
              stdDeviation={size * 0.02}
              floodColor={color}
              floodOpacity="0.2"
            />
          </filter>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={stroke}
        />
        {ratio != null && ratio > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - ratio)}
            filter={`url(#${glowId})`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        )}
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.32,
          fontWeight: 600,
          lineHeight: 1,
        }}
      >
        {value != null ? value : <span style={{ color: 'var(--color-text-secondary)' }}>—</span>}
      </div>
    </div>
  );
};

export default ScoreRing;
