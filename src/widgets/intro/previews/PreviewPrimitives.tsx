import React from 'react';

import { cn } from '@shared/lib/utils';

// Average glyph width at the 12.5px body size of the real cards, so a skeleton line is as
// wide as the value it stands in for.
const CHAR_WIDTH = 6.3;
export const LINE_HEIGHT = 16;

export const PreviewSvg: React.FC<{
  width: number;
  height: number;
  label: string;
  className?: string;
  children: React.ReactNode;
}> = ({ width, height, label, className, children }) => (
  <svg
    viewBox={`0 0 ${width} ${height}`}
    preserveAspectRatio="xMinYMin slice"
    role="img"
    aria-label={label}
    className={cn('bg-card font-sans', className)}
  >
    {children}
  </svg>
);

export const SkeletonLine: React.FC<{ x: number; y: number; text: string; alignEnd?: boolean }> = ({
  x,
  y,
  text,
  alignEnd,
}) => {
  const width = Math.max(14, text.length * CHAR_WIDTH);
  return (
    <rect
      x={alignEnd ? x - width : x}
      y={y - 4}
      width={width}
      height={8}
      rx={4}
      className="fill-muted-foreground/25"
    />
  );
};

export const SkeletonIcon: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <rect x={x - 5} y={y - 5} width={10} height={10} rx={3} className="fill-muted-foreground/35" />
);

const MorePill: React.FC<{ x: number; y: number; text: string }> = ({ x, y, text }) => (
  <>
    <rect
      x={x}
      y={y - 8}
      width={text.length * 6.4 + 12}
      height={16}
      rx={8}
      className="fill-muted"
    />
    <rect
      x={x + 6}
      y={y - 3}
      width={text.length * 6.4}
      height={6}
      rx={3}
      className="fill-muted-foreground/25"
    />
  </>
);

export type ListRowProps = { lines: string[]; more?: string; inlineMore?: boolean };

export function getListRowHeight({ lines, more, inlineMore }: ListRowProps): number {
  return lines.length * LINE_HEIGHT + (more && !inlineMore ? 18 : 0);
}

// An icon beside one or more lines of values, optionally ending in a "+N more" pill.
export const ListRow: React.FC<ListRowProps & { x: number; y: number }> = (props) => {
  const { x, y, lines, more, inlineMore } = props;
  const lastY = y + (lines.length - 1) * LINE_HEIGHT;
  return (
    <>
      <SkeletonIcon x={x} y={y + (getListRowHeight(props) - LINE_HEIGHT) / 2} />
      {lines.map((line, i) => (
        <SkeletonLine key={i} x={x + 17} y={y + i * LINE_HEIGHT} text={line} />
      ))}
      {more && inlineMore && (
        <MorePill x={x + 23 + lines[lines.length - 1].length * CHAR_WIDTH} y={lastY} text={more} />
      )}
      {more && !inlineMore && <MorePill x={x + 17} y={lastY + LINE_HEIGHT + 2} text={more} />}
    </>
  );
};

export const PreviewCard: React.FC<{ x: number; y: number; width: number; height: number }> = ({
  x,
  y,
  width,
  height,
}) => (
  <rect
    x={x}
    y={y}
    width={width}
    height={height}
    rx={6}
    className="fill-card stroke-border drop-shadow-sm"
  />
);

export type CardHeadingProps = { name: string[]; code: string; codeBelow?: boolean };

export function getCardHeadingOffset({ name, codeBelow }: CardHeadingProps): number {
  return (name.length - 1) * 24 + (codeBelow ? 24 : 0);
}

// Bold entity name with its grey code after it, or on its own line.
export const CardHeading: React.FC<CardHeadingProps & { x: number; y: number }> = ({
  x,
  y,
  name,
  code,
  codeBelow,
}) => {
  const codeClassName = 'fill-muted-foreground font-mono font-normal';
  return (
    <>
      {name.map((line, i) => (
        <text key={i} x={x} y={y + i * 24} fontSize={18} className="fill-foreground font-bold">
          {line}
          {!codeBelow && i === name.length - 1 && (
            <tspan dx={6} fontSize={14} className={codeClassName}>
              {code}
            </tspan>
          )}
        </text>
      ))}
      {codeBelow && (
        <text x={x} y={y + name.length * 24 + 1} fontSize={14} className={codeClassName}>
          {code}
        </text>
      )}
    </>
  );
};

export const CARD_COLUMNS = [16, 219, 422, 625, 828];
export const CARD_WIDTH = 179;
