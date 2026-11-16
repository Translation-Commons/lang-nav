import React from 'react';

import { LINE_HEIGHT, PreviewSvg, SkeletonLine } from './PreviewPrimitives';

type LocaleRow = [
  id: string,
  name: string[],
  population: string,
  percent: string,
  source: string[],
  status?: string,
];

const ROWS: LocaleRow[] = [
  ['zh_CN', ['Chinese (China)'], '1,075,035,464', '76.3', ['MOE China 2020'], 'Official'],
  ['hi_IN', ['Hindi (India)'], '506,922,591', '35.9', ['CensusIndia 2011'], 'Official'],
  [
    'en_US',
    ['English (United', 'States)'],
    '322,646,121',
    '94.9',
    ['US Census Bureau', '2023'],
    'Official (de facto)',
  ],
  [
    'id_ID',
    ['Indonesian', '(Indonesia)'],
    '254,904,156',
    '90.2',
    ['BPS Indonesia 2020'],
    'Official',
  ],
  ['pt_BR', ['Portuguese (Brazil)'], '174,879,896', '82.3', ['CLDR 2025'], 'Official'],
  ['en_IN', ['English (India)'], '168,637,820', '11.9', ['CLDR 2025'], 'Official'],
  ['ru_RU', ['Russian (Russia)'], '143,096,361', '98.0', ['Rosstat 2020'], 'Official'],
  ['ur_PK', ['Urdu (Pakistan)'], '125,954,028', '52.2', ['CLDR 2025'], 'Official'],
  ['ja_JP', ['Japanese (Japan)'], '116,095,320', '94.0', ['CLDR 2025'], 'Official'],
  ['es_MX', ['Spanish (Mexico)'], '114,230,522', '87.7', ['UNdata 2020'], 'Official (de facto)'],
  ['pa_Arab_PK', ['Punjabi (Pakistan,', 'Arabic)'], '92,808,231', '38.4', ['CLDR 2025']],
];
const ROW_CENTERS = [80, 114, 150, 188, 224, 258, 292, 326, 360, 394, 430];

const HEADERS: [x: number, lines: string[]][] = [
  [62, ['ID']],
  [152, ['Name']],
  [272, ['Population', '(Writing)']],
  [412, ['Population', '(Writing, percent)']],
  [552, ['Population', '(Writing, source)']],
  [692, ['Official Status']],
];

const Lines: React.FC<{ x: number; y: number; lines: string[] }> = ({ x, y, lines }) =>
  lines.map((line, i) => (
    <SkeletonLine key={i} x={x} y={y + (i - (lines.length - 1) / 2) * LINE_HEIGHT} text={line} />
  ));

const TableRow: React.FC<{ row: LocaleRow; y: number }> = ({ row, y }) => {
  const [id, name, population, percent, source, status] = row;
  return (
    <>
      <text x={62} y={y + 4.5} fontSize={12.5} className="fill-foreground">
        {id}
      </text>
      <Lines x={150} y={y} lines={name} />
      <SkeletonLine x={397} y={y} text={population} alignEnd />
      <SkeletonLine x={529} y={y} text={percent} alignEnd />
      <Lines x={550} y={y} lines={source} />
      {status ? (
        <SkeletonLine x={690} y={y} text={status} />
      ) : (
        <text x={690} y={y + 4.5} fontSize={12} className="fill-muted-foreground/50 italic">
          None
        </text>
      )}
    </>
  );
};

const LocaleTablePreview: React.FC<{ className?: string }> = ({ className }) => (
  <PreviewSvg
    width={818}
    height={460}
    label="Table of locales such as zh_CN, hi_IN and en_US with writing population, source and official status"
    className={className}
  >
    {HEADERS.map(([x, lines]) =>
      lines.map((line, i) => (
        <text
          key={`${x}-${i}`}
          x={x}
          y={(lines.length === 1 ? 45 : 35) + i * 20}
          fontSize={14}
          className="fill-muted-foreground font-semibold"
        >
          {line}
        </text>
      )),
    )}
    <text x={338} y={55} fontSize={13} className="fill-primary">
      ⇅
    </text>
    {ROWS.map((row, i) => (
      <TableRow key={row[0]} row={row} y={ROW_CENTERS[i]} />
    ))}
  </PreviewSvg>
);

export default LocaleTablePreview;
