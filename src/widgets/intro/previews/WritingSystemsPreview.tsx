import React from 'react';

import {
  CARD_COLUMNS,
  CARD_WIDTH,
  CardHeading,
  getCardHeadingOffset,
  getListRowHeight,
  ListRow,
  ListRowProps,
  PreviewCard,
  PreviewSvg,
  SkeletonIcon,
  SkeletonLine,
} from './PreviewPrimitives';

type WritingSystemCard = {
  name: string[];
  code: string;
  codeBelow?: boolean;
  glyph?: string;
  scope?: string[];
  population: string;
  languages: ListRowProps;
};

const SCRIPTS: WritingSystemCard[] = [
  {
    name: ['Latin'],
    code: 'Latn',
    glyph: 'L',
    population: '5,241,005,838',
    languages: { lines: ['English, Spanish,', 'French, Portuguese,'], more: '+6239 more' },
  },
  {
    name: ['Simplified Han'],
    code: 'Hans',
    codeBelow: true,
    glyph: '汉',
    population: '2,593,705,748',
    languages: {
      lines: ['Chinese,', 'Mandarin Chinese,', 'Wu Chinese,', 'Jinyu Chinese,'],
      more: '+11 more',
    },
  },
  {
    name: ['Arabic'],
    code: 'Arab',
    glyph: 'ب',
    population: '1,820,030,570',
    languages: {
      lines: ['Arabic, Urdu,', 'Standard Arabic,', 'Lahnda,'],
      more: '+211 more',
      inlineMore: true,
    },
  },
  {
    name: ['Devanagari'],
    code: 'Deva',
    glyph: 'अ',
    population: '1,138,700,245',
    languages: {
      lines: ['Hindi, Marathi,', 'Bhojpuri,', 'Nepali', '(macrolanguage)'],
      more: '+205 more',
    },
  },
  {
    name: ['Bengali'],
    code: 'Beng',
    glyph: 'ক',
    population: '326,072,158',
    languages: { lines: ['Bengali, Assamese,', 'Rangpuri,', 'Chittagonian,'], more: '+9 more' },
  },
  {
    name: ['Cyrillic'],
    code: 'Cyrl',
    glyph: 'Я',
    population: '303,852,980',
    languages: { lines: ['Russian, Ukrainian,', 'Kazakh, Tajik,'], more: '+128 more' },
  },
  {
    name: ['Traditional Han'],
    code: 'Hant',
    codeBelow: true,
    glyph: '漢',
    population: '159,133,772',
    languages: {
      lines: ['Chinese, Yue Chinese,', 'Late Middle Chinese,', 'Mandarin Chinese,'],
      more: '+2 more',
    },
  },
  {
    name: ['Gurmukhi'],
    code: 'Guru',
    glyph: 'ਗ',
    population: '128,655,912',
    languages: { lines: ['Panjabi'] },
  },
  {
    name: ['Japanese', 'scripts'],
    code: 'Jpan',
    scope: ['Group containing', 'Han characters,', 'Hiragana, Katakana'],
    population: '120,860,698',
    languages: { lines: ['Japanese,', 'Southern Amami-', 'Oshima', ', Yonaguni'] },
  },
  {
    name: ['Telugu'],
    code: 'Telu',
    glyph: 'త',
    population: '101,196,980',
    languages: {
      lines: ['Telugu, Lambadi,', 'Adivasi Oriya,', 'Adilabad Gondi,'],
      more: '+11 more',
    },
  },
];

const ROWS = [
  { top: 16, height: 270 },
  { top: 311, height: 300 },
];

const Glyph: React.FC<{ x: number; y: number; glyph?: string }> = ({ x, y, glyph }) =>
  glyph ? (
    <text x={x} y={y + 5} fontSize={13} className="fill-foreground">
      {glyph}
    </text>
  ) : (
    <text x={x} y={y + 4} fontSize={11} className="fill-muted-foreground/60 italic">
      Not available
    </text>
  );

const WritingSystemCardPreview: React.FC<{ card: WritingSystemCard; index: number }> = ({
  card,
  index,
}) => {
  const left = CARD_COLUMNS[index % 5];
  const { top, height } = ROWS[Math.floor(index / 5)];
  const x = left + 18;
  const glyphY = top + 58 + getCardHeadingOffset(card);
  const scope = { lines: card.scope ?? ['Individual script'] };
  const populationY = glyphY + 28 + getListRowHeight(scope);
  const languagesY = populationY + 22;
  const unicodeY = languagesY + getListRowHeight(card.languages) + 6;
  return (
    <>
      <PreviewCard x={left} y={top} width={CARD_WIDTH} height={height} />
      <CardHeading x={left + 17} y={top + 36} {...card} />
      <SkeletonIcon x={x} y={glyphY} />
      <Glyph x={x + 17} y={glyphY} glyph={card.glyph} />
      <ListRow x={x} y={glyphY + 22} {...scope} />
      <SkeletonIcon x={x} y={populationY} />
      <SkeletonLine x={x + 17} y={populationY} text={card.population} />
      <ListRow x={x} y={languagesY} {...card.languages} />
      <SkeletonIcon x={x} y={unicodeY} />
      <SkeletonLine x={x + 17} y={unicodeY} text="Unicode 1.1" />
    </>
  );
};

const WritingSystemsPreview: React.FC<{ className?: string }> = ({ className }) => (
  <PreviewSvg
    width={1024}
    height={576}
    label="Grid of writing system cards for Latin, Han, Arabic, Devanagari and more"
    className={className}
  >
    {SCRIPTS.map((card, i) => (
      <WritingSystemCardPreview key={card.code} card={card} index={i} />
    ))}
  </PreviewSvg>
);

export default WritingSystemsPreview;
