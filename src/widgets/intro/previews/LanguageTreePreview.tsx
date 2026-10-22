import React from 'react';

import { cn } from '@shared/lib/utils';

import { PreviewSvg } from './PreviewPrimitives';

const LINEAGE = [
  'Indo-European',
  'Classical Indo-European',
  'Indo-Iranian',
  'Indic',
  'Middle-Modern Indo-Aryan',
  'Continental Indo-Aryan',
  'Midlands Indo-Aryan',
  'Shaurasenic',
  'Indo-Aryan Central zone',
  'Western Hindi',
  'Hindustani',
  'Hindi',
];
const DIALECTS = ['Dakhini', 'Khari Boli', 'Literary Hindi'];

const xForDepth = (depth: number) => 10 + depth * 20;
const yForRow = (row: number) => 10 + row * 24;
const HINDI_X = xForDepth(LINEAGE.length - 1);

const InfoIcon: React.FC = () => (
  <tspan dx={5} fontSize={11} className="fill-foreground font-normal not-italic">
    ⓘ
  </tspan>
);

const TreeNode: React.FC<{ name: string; depth: number }> = ({ name, depth }) => {
  const x = xForDepth(depth);
  const y = yForRow(depth);
  const isLeaf = depth === LINEAGE.length - 1;
  return (
    <>
      <rect
        x={x - 10}
        y={y - 11}
        width={22}
        height={22}
        rx={5}
        className={cn('stroke-primary/40', depth >= 8 ? 'fill-primary/40' : 'fill-primary/15')}
      />
      <path
        d={`M${x - 3} ${y - 2} L${x + 5} ${y - 2} L${x + 1} ${y + 3} Z`}
        className="fill-white"
      />
      <text
        x={x + 17}
        y={y + 4.5}
        fontSize={13}
        className={cn('fill-foreground', isLeaf && 'font-bold')}
      >
        {name}
        <InfoIcon />
      </text>
    </>
  );
};

const LanguageTreePreview: React.FC<{ className?: string }> = ({ className }) => (
  <PreviewSvg
    width={592}
    height={333}
    label="Family tree from Indo-European down to Hindi and its dialects"
    className={className}
  >
    {LINEAGE.map((name, depth) => (
      <line
        key={name}
        x1={xForDepth(depth) + 2}
        x2={xForDepth(depth) + 2}
        y1={yForRow(depth) + 11}
        y2={333}
        strokeWidth={1.5}
        className="stroke-primary/40"
      />
    ))}
    {LINEAGE.map((name, depth) => (
      <TreeNode key={name} name={name} depth={depth} />
    ))}
    {DIALECTS.map((name, i) => {
      const y = 294 + i * 16;
      return (
        <React.Fragment key={name}>
          <line
            x1={HINDI_X + 2}
            x2={HINDI_X + 21}
            y1={y}
            y2={y}
            strokeWidth={1.5}
            className="stroke-primary/40"
          />
          <text x={HINDI_X + 24} y={y + 4.5} fontSize={12} className="fill-foreground italic">
            {name}
            <InfoIcon />
          </text>
        </React.Fragment>
      );
    })}
  </PreviewSvg>
);

export default LanguageTreePreview;
